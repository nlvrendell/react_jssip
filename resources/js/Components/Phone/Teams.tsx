import { useState } from "react";
import {
    Search,
    Plus,
    Users,
    Eye,
    ArrowLeft,
} from "lucide-react";
import { usePage } from "@inertiajs/react";
import { Contact } from "@/types";

interface TeamProps {
    contacts: Contact[];
    onSelect: (contact: Contact) => void;
}

export function Teams({ contacts, onSelect }: TeamProps) {
    const page = usePage();
    const [teams] = useState<string[]>(page.props.teams as any);
    const [searchTerm, setSearchTerm] = useState("");
    const [isViewing, setIsViewing] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState("");

    const filteredTeams = teams.filter((team: string) =>
        team.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    const countMembers = (team: string) => {
        let count = 0;
        contacts.forEach((contact: any) => {
            if (contact.site === team || contact.group === team) {
                count++;
            }
        });
        return count;
    };

    const authUser = page.props.auth.user as any;
    const filteredContacts = contacts
        .filter((contact: any) => {
            return contact.user != authUser.meta.user;
        })
        .filter((contact: any) => {
            return (
                contact.site === selectedTeam || contact.group === selectedTeam
            );
        });

    const handleOnClick = (team: string) => {
        setIsViewing(true);
        setSelectedTeam(team);
    };

    return (
        <div className="flex flex-col h-full">
            {isViewing ? (
                <div>
                    <button
                        onClick={() => {
                            setIsViewing(false);
                            setSelectedTeam("");
                        }}
                        className="flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mt-4 ml-2"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Back
                    </button>

                    {filteredContacts.length === 0 ? (
                        <div className="text-center text-gray-500 dark:text-gray-400 py-4">
                            No contacts
                        </div>
                    ) : (
                        filteredContacts.map((contact, index) => (
                            <button
                                key={index}
                                className="w-full flex items-center p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                onClick={() => onSelect(contact)}
                            >
                                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-medium mr-3 text-sm">
                                    {contact.first_name
                                        .charAt(0)
                                        .toUpperCase() +
                                        contact.last_name
                                            .charAt(0)
                                            .toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                                        {contact.first_name +
                                            " " +
                                            contact.last_name}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {contact.user}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            ) : (
                <>
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
                                filteredTeams.map((team, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 flex items-center justify-center font-medium mr-3 text-sm uppercase">
                                                {team
                                                    .split(" ")
                                                    .slice(0, 2)
                                                    .map((word) => word[0])
                                                    .join("")}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-900 dark:text-white text-sm">
                                                    {team}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                                    <Users size={12} />
                                                    <span>
                                                        {countMembers(team)}{" "}
                                                        members
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md"
                                            onClick={() => handleOnClick(team)}
                                        >
                                            <Eye size={16} />
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
                </>
            )}
        </div>
    );
}
