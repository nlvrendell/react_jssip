import { useState } from "react";
import { Search, Plus, MoreVertical, Users } from "lucide-react";

interface Team {
    id: string;
    name: string;
    members: number;
    avatar: string;
}

const mockTeams: Team[] = [
    { id: "1", name: "Sales Team", members: 8, avatar: "ST" },
    { id: "2", name: "Support", members: 12, avatar: "SU" },
    { id: "3", name: "Engineering", members: 15, avatar: "EN" },
    { id: "4", name: "Marketing", members: 6, avatar: "MA" },
    { id: "5", name: "Executive", members: 4, avatar: "EX" },
];

export function Teams() {
    const [teams] = useState<Team[]>(mockTeams);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredTeams = teams.filter((team) =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase())
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
                    {filteredTeams.length > 0 ? (
                        filteredTeams.map((team) => (
                            <div
                                key={team.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                                <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium mr-3 text-sm">
                                        {team.avatar}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white text-sm">
                                            {team.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                            <Users size={12} />
                                            <span>{team.members} members</span>
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
