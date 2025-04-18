import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2, Pencil, Check } from "lucide-react";

interface FoodListItemProps {
  food: {
    id: string;
    name: string;
    grams: number | null;
    unit?: string | null;
    is_completed: boolean;
  };
  editingId: string | null;
  editingName: string;
  editingGrams: string;
  editingUnit: string;
  deletingId: string | null;
  onToggleComplete: (id: string, isCompleted: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: { name?: string; grams?: number | null; unit?: string | null }) => void;
  setEditingId: (id: string | null) => void;
  setEditingName: (name: string) => void;
  setEditingGrams: (grams: string) => void;
  setEditingUnit: (unit: string) => void;
}

export function FoodListItem({
  food,
  editingId,
  editingName,
  editingGrams,
  editingUnit,
  deletingId,
  onToggleComplete,
  onDelete,
  onUpdate,
  setEditingId,
  setEditingName,
  setEditingGrams,
  setEditingUnit,
}: FoodListItemProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: { name?: string; grams?: number | null; unit?: string | null } = {};
    if (editingName && editingName !== food.name) updates.name = editingName;
    if (editingGrams) updates.grams = parseInt(editingGrams);
    if (editingUnit) updates.unit = editingUnit;
    onUpdate(food.id, updates);
  };

  const renderEditForm = () => {
    return (
      <form 
        className="flex items-center gap-2 flex-1"
        onSubmit={handleSubmit}
      >
        <Input
          value={editingName}
          onChange={(e) => setEditingName(e.target.value)}
          className="h-6 px-1 py-0 text-sm flex-1"
          placeholder="Food name"
          autoFocus
        />
        {(food.grams !== null || editingGrams) && (
          <>
            <Input
              type="number"
              value={editingGrams}
              onChange={(e) => setEditingGrams(e.target.value)}
              className="w-20 h-6 px-1 py-0 text-sm"
              placeholder="grams"
            />
            <span className="text-sm">g</span>
          </>
        )}
        {(food.unit || editingUnit) && (
          <Input
            type="text"
            value={editingUnit}
            onChange={(e) => setEditingUnit(e.target.value)}
            className="w-20 h-6 px-1 py-0 text-sm"
            placeholder="unit"
          />
        )}
      </form>
    );
  };

  const renderDisplay = () => {
    return (
      <button
        onClick={() => {
          setEditingId(food.id);
          setEditingName(food.name);
          setEditingGrams(food.grams?.toString() ?? '');
          setEditingUnit(food.unit ?? '');
        }}
        className="hover:underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring rounded px-1"
      >
        <span className="text-foreground">{food.name}</span>
        <span className="text-muted-foreground">
          {(food.grams !== null || food.unit) && ", "}
          {food.grams !== null && `${food.grams}g`}
          {food.grams !== null && food.unit && ' / '}
          {food.unit !== null && `${food.unit}unit`}
        </span>
      </button>
    );
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-2">
      <div className="flex items-center gap-2 flex-1">
        <Checkbox
          checked={food.is_completed}
          onCheckedChange={() => onToggleComplete(food.id, food.is_completed)}
        />
        <div className={`flex-1 ${food.is_completed ? "line-through" : ""}`}>
          {editingId === food.id ? renderEditForm() : renderDisplay()}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (editingId === food.id) {
              handleSubmit({ preventDefault: () => {} } as React.FormEvent);
            } else {
              setEditingId(food.id);
              setEditingName(food.name);
              setEditingGrams(food.grams?.toString() ?? '');
              setEditingUnit(food.unit ?? '');
            }
          }}
          className={`h-8 w-8 text-muted-foreground ${
            editingId === food.id 
              ? "hover:text-green-500" 
              : "hover:text-primary"
          }`}
        >
          {editingId === food.id ? (
            <Check className="h-4 w-4" />
          ) : (
            <Pencil className="h-4 w-4" />
          )}
          <span className="sr-only">
            {editingId === food.id ? `Save ${food.name}` : `Edit ${food.name}`}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(food.id)}
          disabled={deletingId === food.id}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          {deletingId === food.id ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          <span className="sr-only">
            {deletingId === food.id ? "Deleting..." : `Delete ${food.name}`}
          </span>
        </Button>
      </div>
    </div>
  );
} 