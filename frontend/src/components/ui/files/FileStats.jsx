import React from "react";
import { Card, CardContent } from "../card";
import { Folder } from "lucide-react";

export const FileStats = ({ files }) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Всего файлов</p>
            <p className="text-2xl font-bold">{files.length}</p>
          </div>
          <Folder className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};