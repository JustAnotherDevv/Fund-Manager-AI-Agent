import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Vault name must be at least 3 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  strategy: z.string().min(1, {
    message: "Please select a strategy.",
  }),
  risk: z.enum(["Low", "Medium", "High"]),
  assets: z.string().min(1, {
    message: "Please enter at least one asset.",
  }),
  initialDeposit: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    },
    {
      message: "Initial deposit must be a positive number.",
    }
  ),
  aiModel: z.string().min(1, {
    message: "Please select an AI model.",
  }),
  rebalanceFrequency: z.number().min(1).max(30),
});

export function CreateVaultForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      strategy: "",
      risk: "Medium",
      assets: "",
      initialDeposit: "",
      aiModel: "",
      rebalanceFrequency: 7,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.success("Vault created successfully!", {
      description: `${values.name} has been created with ${values.initialDeposit} initial deposit.`,
    });
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vault Name</FormLabel>
                <FormControl>
                  <Input placeholder="Alpha Yield Optimizer" {...field} />
                </FormControl>
                <FormDescription>
                  A descriptive name for your vault.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="strategy"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Strategy Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a strategy" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yield-farming">Yield Farming</SelectItem>
                    <SelectItem value="liquidity-provision">
                      Liquidity Provision
                    </SelectItem>
                    <SelectItem value="staking">Staking</SelectItem>
                    <SelectItem value="lending">Lending</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage</SelectItem>
                    <SelectItem value="custom">Custom Strategy</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The primary strategy for this vault.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your vault strategy and goals..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Explain how your vault works and what it aims to achieve.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="risk"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Risk Level</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The risk profile of this vault.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Assets</FormLabel>
                <FormControl>
                  <Input placeholder="ETH, USDC, AAVE, etc." {...field} />
                </FormControl>
                <FormDescription>
                  Comma-separated list of assets to include.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="initialDeposit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial Deposit</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0" {...field} />
                </FormControl>
                <FormDescription>
                  Amount to deposit when creating the vault.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aiModel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>AI Agent</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select AI agent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="yieldbot">YieldBot v2.3.1</SelectItem>
                    <SelectItem value="stablegenius">
                      StableGenius v1.8.5
                    </SelectItem>
                    <SelectItem value="momentummaster">
                      MomentumMaster v3.1.0
                    </SelectItem>
                    <SelectItem value="stakewise">StakeWise v2.0.4</SelectItem>
                    <SelectItem value="liquidityai">
                      LiquidityAI v1.9.2
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  The AI agent that will manage this vault.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="rebalanceFrequency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rebalance Frequency (days): {field.value}</FormLabel>
              <FormControl>
                <Slider
                  min={1}
                  max={30}
                  step={1}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                />
              </FormControl>
              <FormDescription>
                How often the AI agent should rebalance your portfolio.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Vault
        </Button>
      </form>
    </Form>
  );
}