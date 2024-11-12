"use client";

import { KnowledgeHeader } from "@/components/knowledge/knowledge-header";
import { KnowledgeList } from "@/components/knowledge/knowledge-list";
import { UploadButton } from "@/components/knowledge/upload-button";
import { KnowledgeGraph } from "@/components/knowledge/knowledge-graph";
import { FolderTree } from "@/components/knowledge/folder-tree";
import { ContextSelector } from "@/components/knowledge/context-selector";
import { StorageStats } from "@/components/knowledge/storage-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";

export interface KnowledgeItem {
  id: string;
  name: string;
  type: string;
  size: number;
  folderId?: string;
  uploadedAt: Date;
  status: "processing" | "ready" | "error";
  embedding?: number[];
  summary?: string;
  tags?: string[];
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: Date;
}

export interface StorageInfo {
  totalSize: number;
  usedSize: number;
  documentCount: number;
  embeddingSize: number;
}

export default function KnowledgePage() {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [storageInfo, setStorageInfo] = useState<StorageInfo>({
    totalSize: 10 * 1024 * 1024 * 1024, // 10GB
    usedSize: 2.5 * 1024 * 1024 * 1024, // 2.5GB
    documentCount: 150,
    embeddingSize: 1.2 * 1024 * 1024 * 1024, // 1.2GB
  });
  const { toast } = useToast();

  const handleUpload = async (file: File, folderId?: string) => {
    const newItem: KnowledgeItem = {
      id: Date.now().toString(),
      name: file.name,
      type: file.type,
      size: file.size,
      folderId,
      uploadedAt: new Date(),
      status: "processing",
    };

    setItems((prev) => [...prev, newItem]);

    toast({
      title: "File uploaded",
      description: "The file will be processed and added to the knowledge base.",
    });

    // Simulate processing
    setTimeout(() => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === newItem.id
            ? {
                ...item,
                status: "ready",
                summary: "This is an automatically generated summary of the document content.",
                tags: ["tag1", "tag2"],
              }
            : item
        )
      );
    }, 2000);
  };

  const handleCreateFolder = (name: string, parentId?: string) => {
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      createdAt: new Date(),
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleSelectItems = (itemIds: string[]) => {
    setSelectedItems(itemIds);
    toast({
      title: "Context Updated",
      description: `${itemIds.length} documents selected for current context.`,
    });
  };

  return (
    <div className="flex h-full flex-col">
      <KnowledgeHeader />
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold tracking-tight">Knowledge Base</h2>
          <div className="flex items-center gap-4">
            <StorageStats info={storageInfo} />
            <UploadButton onUpload={handleUpload} currentFolderId={selectedFolderId} />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <FolderTree
              folders={folders}
              onCreateFolder={handleCreateFolder}
              onSelectFolder={setSelectedFolderId}
              selectedFolderId={selectedFolderId}
            />
          </div>

          <div className="col-span-9">
            <Tabs defaultValue="list">
              <TabsList>
                <TabsTrigger value="list">List View</TabsTrigger>
                <TabsTrigger value="graph">Knowledge Graph</TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <ContextSelector
                  items={items}
                  selectedItems={selectedItems}
                  onSelectItems={handleSelectItems}
                />
                <KnowledgeList
                  items={items.filter((item) => !selectedFolderId || item.folderId === selectedFolderId)}
                  selectedItems={selectedItems}
                  onSelectItems={handleSelectItems}
                />
              </TabsContent>

              <TabsContent value="graph">
                <KnowledgeGraph items={items} onSelectItems={handleSelectItems} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}