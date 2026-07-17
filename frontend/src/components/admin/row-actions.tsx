import { Button } from "@/components/ui/button";

type RowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

// Shared edit/delete buttons for admin tables. Equal width keeps columns aligned.
export function RowActions({
  onEdit,
  onDelete,
  editLabel = "Sửa",
  deleteLabel = "Xóa",
}: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="min-w-[68px]"
        onClick={onEdit}
      >
        {editLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className="min-w-[68px]"
        onClick={onDelete}
      >
        {deleteLabel}
      </Button>
    </div>
  );
}
