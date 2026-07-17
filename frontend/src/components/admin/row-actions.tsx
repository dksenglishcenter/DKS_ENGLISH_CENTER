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
  // Fixed equal width + tighter radius so both buttons line up perfectly.
  const actionClass = "w-[72px] rounded-lg px-0";

  return (
    <div className="flex items-center justify-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={actionClass}
        onClick={onEdit}
      >
        {editLabel}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="destructive"
        className={actionClass}
        onClick={onDelete}
      >
        {deleteLabel}
      </Button>
    </div>
  );
}
