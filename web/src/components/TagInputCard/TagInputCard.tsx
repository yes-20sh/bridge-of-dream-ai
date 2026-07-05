import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function TagInputCard({
  title,
  description,
  icon: Icon,
  placeholder,
  tags,
  setTags,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  placeholder: string;
  tags: string[];
  setTags: React.Dispatch<React.SetStateAction<string[]>>;
}) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim() && !tags.includes(inputValue.trim())) {
      setTags([...tags, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  const handleRemove = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <Card className="shadow-sm border-zinc-200">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="pl-10 border-zinc-200"
            />
          </div>
          <Button
            type="button"
            onClick={handleAdd}
            variant="outline"
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-50"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs px-3 py-1.5 rounded-full font-medium shadow-sm transition-all hover:bg-zinc-800"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                className="text-zinc-400 hover:text-white transition-colors"
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          {tags.length === 0 && (
            <span className="text-sm text-zinc-400 italic py-1">
              No items added yet.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
