"use client";

import { useState } from "react";
import { toast } from "sonner";
import { GroupMemberSearchCombobox } from "./GroupMemberSearchCombobox";
import { GroupMemberSearchResultDto } from "@/types/admin/group.types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

export function GroupMemberSearchDemo() {
  const [selectedMember, setSelectedMember] =
    useState<GroupMemberSearchResultDto | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMemberSelect = (member: GroupMemberSearchResultDto | null) => {
    if (member) {
      setSelectedMember(member);
      setSearchQuery(member.fullName); // Update search query when member is selected
      toast.success("Đã chọn thành viên nhóm", {
        description: `${member.fullName} (${member.roleInGroup})`,
      });
    } else {
      setSearchQuery(""); // Clear search query when member is cleared
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          Group Member Search Component Demo
        </h1>
        <p className="text-muted-foreground mt-2">
          Demo component để kiểm tra các tính năng của GroupMemberSearchCombobox
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Group Member Search */}
        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm thành viên nhóm</CardTitle>
            <CardDescription>
              Tìm kiếm thành viên trong một nhóm cụ thể với infinite scroll
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <GroupMemberSearchCombobox
              value={selectedMember}
              onSelectUser={handleMemberSelect}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              groupId="sample-group-id-123"
              placeholder="Tìm kiếm thành viên nhóm..."
            />

            {selectedMember && (
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Thành viên đã chọn:</h4>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedMember.avatarUrl}
                      alt={selectedMember.fullName}
                    />
                    <AvatarFallback>
                      {selectedMember.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedMember.fullName}</p>
                    <Badge variant="secondary" className="mt-1">
                      {selectedMember.roleInGroup}
                    </Badge>
                    <Badge variant="outline" className="mt-1 ml-2">
                      ID: {selectedMember.userId.slice(0, 8)}...
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Features Showcase */}
        <Card>
          <CardHeader>
            <CardTitle>✨ Tính năng chính</CardTitle>
            <CardDescription>
              Danh sách các tính năng đã được implement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-primary">
                  🔧 Core Features
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Infinite Scroll Pagination</p>
                      <p className="text-sm text-muted-foreground">
                        Sử dụng useInfiniteQuery để tải dữ liệu theo trang khi
                        scroll
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Group-Specific Search</p>
                      <p className="text-sm text-muted-foreground">
                        Tìm kiếm chỉ trong thành viên của nhóm cụ thể
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Role Display</p>
                      <p className="text-sm text-muted-foreground">
                        Hiển thị vai trò của thành viên trong nhóm
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold text-lg text-primary">
                  🚀 UX & Performance
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Debounced Search</p>
                      <p className="text-sm text-muted-foreground">
                        Tìm kiếm với delay 300ms để tối ưu hiệu suất
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Loading States</p>
                      <p className="text-sm text-muted-foreground">
                        Skeleton loader và loading indicators
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <p className="font-medium">Error Handling</p>
                      <p className="text-sm text-muted-foreground">
                        Xử lý lỗi với retry mechanism
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Cách sử dụng component</CardTitle>
          <CardDescription>
            Hướng dẫn tích hợp GroupMemberSearchCombobox
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">1. Import component:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`import { GroupMemberSearchCombobox } from "@/components/features/admin/groups/GroupMemberSearchCombobox";`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">2. Sử dụng cơ bản:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`const [selectedMember, setSelectedMember] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

<GroupMemberSearchCombobox
  value={selectedMember}
  onSelectUser={setSelectedMember}
  searchQuery={searchQuery}
  onSearchQueryChange={setSearchQuery}
  groupId="group-id-123"
  placeholder="Tìm kiếm thành viên nhóm..."
/>`}
              </pre>
            </div>

            <div>
              <h4 className="font-medium mb-2">3. Props available:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  <code>value</code>: Thành viên đã chọn (controlled)
                </li>
                <li>
                  <code>onSelectUser</code>: Callback khi chọn thành viên
                  (required)
                </li>
                <li>
                  <code>searchQuery</code>: Text tìm kiếm hiện tại (controlled)
                </li>
                <li>
                  <code>onSearchQueryChange</code>: Callback khi text tìm kiếm
                  thay đổi (required)
                </li>
                <li>
                  <code>groupId</code>: ID nhóm để tìm kiếm thành viên
                  (required)
                </li>
                <li>
                  <code>placeholder</code>: Placeholder text cho input
                  (optional)
                </li>
                <li>
                  <code>className</code>: CSS classes tùy chỉnh (optional)
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">4. Tính năng tự động:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>
                  Infinite scroll pagination khi scroll đến cuối danh sách
                </li>
                <li>Error handling với retry mechanism</li>
                <li>Skeleton loading cho trạng thái ban đầu</li>
                <li>Debounced search (300ms delay)</li>
                <li>Initial results khi mở combobox</li>
                <li>Duplicate removal và data validation</li>
                <li>
                  Fully controlled component với state management ở parent
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

