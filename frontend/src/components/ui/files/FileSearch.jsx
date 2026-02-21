import React from "react";
import { Input } from "../input";
import { Search } from "lucide-react";

export const FileSearch = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="relative w-full sm:w-auto">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder="Поиск файлов..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="pl-10 w-full"
      />
    </div>
  );
};