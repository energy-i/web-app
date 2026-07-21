import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUser } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import type { User, UserRole } from "@/lib/types";

const formSchema = z.object({
  role: z.enum(["OWNER", "ADMIN", "USER"]),
});

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  USER: "User",
};

const EditUserForm = ({ user }: { user: User }) => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const currentRole: UserRole = user.role ?? "USER";

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: currentRole,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof formSchema>) => updateUser(user.id, data),
    onSuccess: async () => {
      toast.success("User updated", {
        description: `${user.name}'s role has been updated.`,
      });
      setIsOpen(false);
      await queryClient.invalidateQueries({
        queryKey: queryKeys.organisationUsers,
      });
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
    onError: (error) => {
      toast.error("Failed to update user", {
        description:
          error instanceof Error ? error.message : "Something went wrong.",
      });
    },
  });

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (open) {
          form.reset({ role: currentRole });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button size="xs" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>
              Update {user.name}&#39;s role in your organisation.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="my-4">
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="role">Role</FieldLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OWNER">{ROLE_LABELS.OWNER}</SelectItem>
                      <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                      <SelectItem value="USER">{ROLE_LABELS.USER}</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <Button disabled={mutation.isPending} type="submit">
              Save changes
            </Button>
            <DialogClose asChild>
              <Button variant="outline" type="button">
                Close
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserForm;
