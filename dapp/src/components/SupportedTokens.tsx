import { Address } from "viem";
import { TokenDisplay } from "./TokenDisplay";

type SupportedTokensProps = {
  tokens: Address[];
  symbols?: string[];
};

export const SupportedTokens = ({ tokens, symbols }: SupportedTokensProps) => {
  if (symbols && symbols.length > 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {symbols.map((symbol, i) => (
          <div
            key={i}
            className="text-xs bg-secondary rounded-full px-2 py-1"
            title={tokens[i]}
          >
            {symbol}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tokens.map((token, i) => (
        <div key={i} className="text-xs bg-secondary rounded-full px-2 py-1">
          <TokenDisplay tokenAddress={token} />
        </div>
      ))}
    </div>
  );
};
