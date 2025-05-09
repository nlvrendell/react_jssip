import { useState } from "react";
import { Search } from "lucide-react";
import { Contact } from "@/types";
import { usePage } from "@inertiajs/react";

interface ContactsListProps {
    contacts: Contact[];
    onSelect: (contact: Contact) => void;
}

export function ContactsList({ contacts, onSelect }: ContactsListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const authUser = usePage().props.auth.user as any;

    const filteredContacts = contacts
        .filter((contact) => {
            return contact.user != authUser.meta.user;
        })
        .filter((contact) => {
            let userMatch = false;
            if (contact?.user) {
                // there are contacts with no users
                userMatch = contact.user
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase());
            }

            return (
                contact.first_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                contact.last_name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                userMatch
            );
        });

    console.log("filteredContacts", filteredContacts);

    return (
        <div className="flex flex-col h-full">
            <div className="p-4">
                <div className="relative">
                    <Search
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        size={16}
                    />
                    <input
                        type="text"
                        placeholder="Search contacts"
                        className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg text-gray-900 dark:text-white text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredContacts.length > 0 ? (
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
                    ) : (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400 text-sm">
                            No contacts found
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
