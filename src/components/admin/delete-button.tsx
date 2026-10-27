"use client";

import { buttonClass } from "@/lib/ui";

export function DeleteButton({
  action,
  id,
  confirmText,
  label = "Hapus",
  disabled = false,
  disabledReason,
}: {
  action: (formData: FormData) => Promise<void>;
  id: number;
  confirmText: string;
  label?: string;
  disabled?: boolean;
  disabledReason?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmText)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        className={buttonClass("danger", "sm")}
      >
        {label}
      </button>
    </form>
  );
}
