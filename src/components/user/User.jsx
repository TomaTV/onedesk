import { Settings, Trash2 } from "lucide-react";

export default function User() {
    return (
    <div className="mt-auto p-3">
        <div className="flex items-center gap-2.5 px-1.5 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer transition-colors duration-150">
            <div className="w-6 h-6 rounded-md bg-blue-500 flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-medium">U</span>
            </div>
            <div className="flex-grow">
                <div className="text-sm font-medium text-gray-800 leading-tight">User</div>
                </div>
                <div className="flex items-center gap-2 hover:bg-gray-200 cursor-pointer transition-colors duration-150">
                    <Settings className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center gap-2 hover:bg-gray-200 cursor-pointer transition-colors duration-150">
                    <Trash2 className="w-4 h-4 text-gray-500" />
                </div>
        </div>
    </div >
    );
}