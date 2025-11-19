import { useState } from "react";
import AuthDialog from "../AuthDialog";
import { Button } from "@/components/ui/button";

export default function AuthDialogExample() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Open Auth Dialog</Button>
      <AuthDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
