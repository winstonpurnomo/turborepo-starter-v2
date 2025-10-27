import { PlusIcon } from "@phosphor-icons/react";
import { Button } from "@repo/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import type { OrganizationMembership } from "@workos-inc/node";
import { useState } from "react";
import { CreateOrganizationForm } from "./create-organization-form";

export function OrgSwitcher({ orgs }: { orgs: OrganizationMembership[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {orgs.map((org) => (
        <div key={org.id}>{org.organizationName}</div>
      ))}

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogTrigger
          render={(props) => (
            <Button className="mt-4" variant="outline" {...props}>
              <PlusIcon className="h-4 w-4" />
              Create Organization
            </Button>
          )}
        />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Organization</DialogTitle>
          </DialogHeader>
          <CreateOrganizationForm />
        </DialogContent>
      </Dialog>
    </div>
  );
}
