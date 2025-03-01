// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";

/**
 * @title AIFundRegistry
 * @dev Registry for AI fund managers
 */
contract AIFundRegistry is Ownable, ReentrancyGuard {
    using EnumerableSet for EnumerableSet.AddressSet;

    struct AIManager {
        string name;
        string description;
        string strategy;
        address implementation;
        address[] supportedTokens;
        bool isActive;
        uint256 createdAt;
    }

    EnumerableSet.AddressSet private managers;
    mapping(address => AIManager) public aiManagers;
    mapping(address => address[]) public userFunds;
    
    event AIManagerRegistered(address indexed implementation, string name, string strategy);
    event AIManagerDeactivated(address indexed implementation);
    event FundCreated(address indexed owner, address indexed fundAddress, address indexed managerImplementation);

    constructor() Ownable(msg.sender) {}

    function registerAIManager(
        string calldata name,
        string calldata description,
        string calldata strategy,
        address implementation,
        address[] calldata supportedTokens
    ) external onlyOwner {
        require(implementation != address(0), "Invalid implementation address");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        AIManager storage manager = aiManagers[implementation];
        manager.name = name;
        manager.description = description;
        manager.strategy = strategy;
        manager.implementation = implementation;
        manager.supportedTokens = supportedTokens;
        manager.isActive = true;
        manager.createdAt = block.timestamp;
        
        managers.add(implementation);
        
        emit AIManagerRegistered(implementation, name, strategy);
    }
    
    function deactivateAIManager(address implementation) external onlyOwner {
        require(managers.contains(implementation), "Manager not registered");
        aiManagers[implementation].isActive = false;
        emit AIManagerDeactivated(implementation);
    }
    
    function createFund(address managerImplementation) external nonReentrant returns (address) {
        require(managers.contains(managerImplementation), "Manager not registered");
        require(aiManagers[managerImplementation].isActive, "Manager not active");
        
        AIFund fund = new AIFund(
            msg.sender,
            managerImplementation,
            aiManagers[managerImplementation].supportedTokens
        );
        
        userFunds[msg.sender].push(address(fund));
        
        emit FundCreated(msg.sender, address(fund), managerImplementation);
        return address(fund);
    }
    
    function getAllAIManagers() external view returns (address[] memory) {
        uint256 length = managers.length();
        address[] memory result = new address[](length);
        
        for (uint256 i = 0; i < length; i++) {
            result[i] = managers.at(i);
        }
        
        return result;
    }
    
    function getActiveAIManagers() external view returns (address[] memory) {
        uint256 count = 0;
        uint256 length = managers.length();
        
        for (uint256 i = 0; i < length; i++) {
            if (aiManagers[managers.at(i)].isActive) {
                count++;
            }
        }
        
        address[] memory result = new address[](count);
        count = 0;
        
        for (uint256 i = 0; i < length; i++) {
            address managerAddr = managers.at(i);
            if (aiManagers[managerAddr].isActive) {
                result[count] = managerAddr;
                count++;
            }
        }
        
        return result;
    }
    
    function getUserFunds(address user) external view returns (address[] memory) {
        return userFunds[user];
    }
}

/**
 * @title AIFund
 * @dev Individual fund that's managed by an AI manager
 */
contract AIFund is ReentrancyGuard {
    struct Transaction {
        address token;
        uint256 amount;
        bool isDeposit;
        uint256 timestamp;
    }
    
    address public owner;
    address public aiManager;
    address[] public supportedTokens;
    mapping(address => uint256) public tokenBalances;
    mapping(address => bool) public supportedTokensMap;
    
    Transaction[] public transactions;
    
    event Deposit(address indexed token, uint256 amount);
    event Withdrawal(address indexed token, uint256 amount);
    event StrategyExecuted(bytes strategyData);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }
    
    modifier onlyAIManager() {
        require(msg.sender == aiManager, "Not the AI manager");
        _;
    }
    
    constructor(address _owner, address _aiManager, address[] memory _supportedTokens) {
        owner = _owner;
        aiManager = _aiManager;
        supportedTokens = _supportedTokens;
        
        for (uint256 i = 0; i < _supportedTokens.length; i++) {
            supportedTokensMap[_supportedTokens[i]] = true;
        }
    }
    
    function deposit(address token, uint256 amount) external nonReentrant {
        require(supportedTokensMap[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        tokenBalances[token] += amount;
        
        transactions.push(Transaction({
            token: token,
            amount: amount,
            isDeposit: true,
            timestamp: block.timestamp
        }));
        
        emit Deposit(token, amount);
    }
    
    function withdraw(address token, uint256 amount) external onlyOwner nonReentrant {
        require(supportedTokensMap[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        require(tokenBalances[token] >= amount, "Insufficient balance");
        
        tokenBalances[token] -= amount;
        IERC20(token).transfer(owner, amount);
        
        transactions.push(Transaction({
            token: token,
            amount: amount,
            isDeposit: false,
            timestamp: block.timestamp
        }));
        
        emit Withdrawal(token, amount);
    }
    
    function executeStrategy(bytes calldata strategyData) external onlyAIManager {
        // todo - add calldata execution through proxy
        emit StrategyExecuted(strategyData);
    }
    
    function getBalance(address token) external view returns (uint256) {
        return tokenBalances[token];
    }
    
    function getAllBalances() external view returns (address[] memory, uint256[] memory) {
        uint256[] memory balances = new uint256[](supportedTokens.length);
        
        for (uint256 i = 0; i < supportedTokens.length; i++) {
            balances[i] = tokenBalances[supportedTokens[i]];
        }
        
        return (supportedTokens, balances);
    }
    
    function getTransactionHistory() external view returns (Transaction[] memory) {
        return transactions;
    }
}

/**
 * @title IAIManager
 * @dev Interface for AI manager implementations
 */
interface IAIManager {
    function executeStrategy(address fund, bytes calldata strategyData) external;
    function getPerformanceMetrics(address fund) external view returns (bytes memory);
    function getSupportedTokens() external view returns (address[] memory);
}

/**
 * @title BaseAIManager
 * @dev Base implementation for AI managers
 */
 contract BaseAIManager is IAIManager {
    address public registry;
    string public name;
    string public description;
    string public strategy;
    address[] public supportedTokens;
    
    mapping(address => uint256) public fundCreationTime;
    mapping(address => bytes) public lastStrategyExecution;
    
    event StrategyExecuted(address indexed fund, bytes strategyData);
    
    modifier onlyRegistry() {
        require(msg.sender == registry, "Not the registry");
        _;
    }
    
    constructor(
        address _registry,
        string memory _name,
        string memory _description,
        string memory _strategy,
        address[] memory _supportedTokens
    ) {
        registry = _registry;
        name = _name;
        description = _description;
        strategy = _strategy;
        supportedTokens = _supportedTokens;
    }
    
    function executeStrategy(address fund, bytes calldata strategyData) external virtual override {
        if (fundCreationTime[fund] == 0) {
            fundCreationTime[fund] = block.timestamp;
        }
        
        lastStrategyExecution[fund] = strategyData;
        AIFund(fund).executeStrategy(strategyData);
        
        emit StrategyExecuted(fund, strategyData);
    }

    function getPerformanceMetrics(address fund) external view override returns (bytes memory) {
        return abi.encode(
            "agent_metrics",
            fundCreationTime[fund],
            block.timestamp,
            lastStrategyExecution[fund]
        );
    }
    
    function getSupportedTokens() external view override returns (address[] memory) {
        return supportedTokens;
    }
}
