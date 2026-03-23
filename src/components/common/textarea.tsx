import { cx } from "cva";

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cx(
        "flex-1 min-h-48 resize-y rounded-md bg-slate-dark p-3 text-xs text-cloud-light placeholder:text-cloud-medium/50 focus:outline-none",
        className,
      )}
      {...props}
    />
  );
}
