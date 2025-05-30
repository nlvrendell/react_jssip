import { useState } from "react";
import { Search, Plus, MoreVertical, Users } from "lucide-react";
import { usePage } from "@inertiajs/react";

interface Park {
    description: string;
    queue_name: string;
    domain: string;
    connect_to: string;
    avatar: string;
}

export function Parks() {
    const [parks] = useState<Park[]>(usePage().props.parks as Park[]);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredParks = parks.filter(
        (park) =>
            park.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            park.queue_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 flex justify-between items-center">
                <div className="relative flex-1">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search teams"
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="ml-2 p-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors">
                    <Plus size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredParks.length > 0 ? (
                        filteredParks.map((park) => (
                            <div
                                key={park.queue_name}
                                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium mr-3 text-sm">
                                        {park.description
                                            .split(" ")
                                            .slice(0, 2)
                                            .map((word: string) => word[0])
                                            .join("")}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                            {park.description}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <span>{park.queue_name}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md">
                                    <MoreVertical size={16} />
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No teams found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
