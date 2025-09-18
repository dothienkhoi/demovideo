import { Compass } from "lucide-react";

export default function CommunitiesPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center">
        <Compass className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Cộng đồng
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Khám phá và tham gia các cộng đồng thú vị trên FastBite Group.
        </p>
        <div className="bg-gradient-to-r from-cyan-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Tính năng cộng đồng đang được phát triển. Hãy quay lại sau nhé!
          </p>
        </div>
      </div>
    </div>
  );
}
