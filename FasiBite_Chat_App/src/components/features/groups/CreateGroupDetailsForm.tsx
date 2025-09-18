"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, X, Users, Globe, Lock } from "lucide-react";

import {
  createChatGroupSchema,
  CreateChatGroupFormData,
} from "@/lib/schemas/customer/group.schema";
import { GroupType } from "@/types/customer/group";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CreateGroupDetailsFormProps {
  onSuccess: (data: CreateChatGroupFormData) => void;
  isLoading: boolean;
}

export function CreateGroupDetailsForm({
  onSuccess,
  isLoading,
}: CreateGroupDetailsFormProps) {
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const form = useForm<CreateChatGroupFormData>({
    resolver: zodResolver(createChatGroupSchema),
    defaultValues: {
      groupName: "",
      description: "",
      groupType: GroupType.Private,
      avatarFile: undefined,
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file before setting
      const maxSize = 2 * 1024 * 1024; // 2MB
      const acceptedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (file.size > maxSize) {
        form.setError("avatarFile", {
          message: "Ảnh đại diện không được lớn hơn 2MB.",
        });
        return;
      }

      if (!acceptedTypes.includes(file.type)) {
        form.setError("avatarFile", {
          message: "Chỉ hỗ trợ các định dạng .jpg, .jpeg, .png và .webp.",
        });
        return;
      }

      // Clear any previous errors
      form.clearErrors("avatarFile");

      // Set the file in form
      form.setValue("avatarFile", file);

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveAvatar = () => {
    form.setValue("avatarFile", undefined);
    setAvatarPreview(null);
    form.clearErrors("avatarFile");
  };

  const onSubmit = (data: CreateChatGroupFormData) => {
    // Extra validation layer to ensure no bypassing of limits
    console.log("Form data before submission:", {
      groupName: data.groupName,
      groupNameLength: data.groupName?.length,
      description: data.description,
      descriptionLength: data.description?.length,
    });

    // Additional client-side validation as a safeguard
    if (data.groupName && data.groupName.length > 20) {
      form.setError("groupName", {
        message: "Tên nhóm không được vượt quá 20 ký tự.",
      });
      return;
    }

    if (data.description && data.description.length > 100) {
      form.setError("description", {
        message: "Mô tả không được vượt quá 100 ký tự.",
      });
      return;
    }

    onSuccess(data);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 px-4 py-2 rounded-full text-blue-600 dark:text-blue-400 text-sm font-medium mb-3">
          <Users className="h-4 w-4" />
          <span>Bước 1: Thông tin cơ bản</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md mx-auto leading-relaxed">
          Tạo nhóm chat với thông tin cơ bản. Bạn có thể thêm thành viên sau.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Main Content */}
          <div className="max-w-sm mx-auto space-y-5">
            {/* Avatar Upload Section */}
            <div className="flex justify-center">
              <div className="text-center space-y-4">
                <div className="relative group">
                  <Avatar className="h-20 w-20 ring-4 ring-white/20 dark:ring-gray-700/20 shadow-xl">
                    <AvatarImage
                      src={avatarPreview || undefined}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                      {form.watch("groupName")?.charAt(0)?.toUpperCase() ||
                        "📁"}
                    </AvatarFallback>
                  </Avatar>

                  {avatarPreview && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}

                  {/* Upload overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center">
                    <Upload className="h-5 w-5 text-white" />
                  </div>
                </div>

                <Label
                  htmlFor="avatar-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 customer-primary-button text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Upload className="h-4 w-4" />
                  {avatarPreview ? "Thay đổi ảnh" : "Tải ảnh đại diện"}
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
                <FormField
                  control={form.control}
                  name="avatarFile"
                  render={() => (
                    <FormItem>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
                  JPG, PNG • Tối đa 2MB
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-6">
              {/* Group Name */}
              <FormField
                control={form.control}
                name="groupName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700 dark:text-gray-200 font-medium">
                      <Users className="h-4 w-4 text-blue-500" />
                      Tên nhóm *
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Nhập tên nhóm..."
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const truncatedValue = value.slice(0, 20);
                            field.onChange(truncatedValue);
                          }}
                          disabled={isLoading}
                          maxLength={20}
                          className="pr-16 h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                          <span
                            className={
                              field.value && field.value.length > 15
                                ? "text-orange-500 font-medium"
                                : "text-gray-500 dark:text-gray-400"
                            }
                          >
                            {field.value?.length || 0}/20
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500 dark:text-gray-400">
                      Tối đa 20 ký tự. Tên này sẽ hiển thị cho tất cả thành viên.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Mô tả nhóm
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Mô tả ngắn gọn về nhóm của bạn (tùy chọn)..."
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            const truncatedValue = value.slice(0, 100);
                            field.onChange(truncatedValue);
                          }}
                          disabled={isLoading}
                          maxLength={100}
                          rows={3}
                          className="resize-none pr-14"
                        />
                        <div className="absolute right-3 bottom-3 text-xs text-muted-foreground">
                          <span
                            className={
                              field.value && field.value.length > 80
                                ? "text-orange-500 font-medium"
                                : ""
                            }
                          >
                            {field.value?.length || 0}/100
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Tối đa 100 ký tự. Mô tả này sẽ giúp mọi người hiểu về mục
                      đích của nhóm.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Group Type */}
              <FormField
                control={form.control}
                name="groupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-8 4h16a2 2 0 002-2v-8a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2zM8 7V5a4 4 0 118 0v2m-8 6h16"
                        />
                      </svg>
                      Loại nhóm *
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="space-y-0"
                        disabled={isLoading}
                      >
                        <div className="space-y-2">
                          <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                              field.value === GroupType.Private
                                ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                                : "border-border hover:border-blue-200"
                            }`}
                          >
                            <RadioGroupItem
                              value={GroupType.Private}
                              id="private"
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor="private"
                              className="cursor-pointer flex-1"
                            >
                              <div className="flex items-center gap-2 font-medium text-sm mb-0.5">
                                <Lock className="h-4 w-4 text-blue-500" />
                                Riêng tư
                              </div>
                              <div className="text-xs text-muted-foreground leading-tight">
                                Chỉ những người được mời mới có thể tham gia.
                              </div>
                            </Label>
                          </div>

                          <div
                            className={`flex items-center space-x-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-sm ${
                              field.value === GroupType.Public
                                ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                                : "border-border hover:border-green-200"
                            }`}
                          >
                            <RadioGroupItem
                              value={GroupType.Public}
                              id="public"
                              className="mt-0.5"
                            />
                            <Label
                              htmlFor="public"
                              className="cursor-pointer flex-1"
                            >
                              <div className="flex items-center gap-2 font-medium text-sm mb-0.5">
                                <Globe className="h-4 w-4 text-green-500" />
                                Công khai
                              </div>
                              <div className="text-xs text-muted-foreground leading-tight">
                                Bất kỳ ai cũng có thể tìm thấy và tham gia.
                              </div>
                            </Label>
                          </div>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Bạn có thể thay đổi cài đặt này sau khi tạo nhóm.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-6">
            <Button
              type="submit"
              disabled={isLoading || !form.watch("groupName")?.trim()}
              className="w-full max-w-sm h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
                  Đang tạo nhóm...
                </>
              ) : (
                <>
                  <Users className="w-5 h-5 mr-3" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
