/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import styles from "./styles/searchDropUp";
import { backendUrl } from "./apiEndpoint";

interface DropUpProps {
    position: string;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
}

function SeacrchDropUp({ position, name, setName }: DropUpProps) {
    const [options, setOptions] = useState<string[]>([]);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropUpRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const interval = setInterval(async () => {
            await fetch(`${backendUrl}/users`)
                .then((response) => response.json())
                .then((data) => {
                    setOptions(data.users);
                });
        }, 1000);

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            clearInterval(interval);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase();
        setName(value);
        setFilteredOptions(
            options.filter((option) => option.toLowerCase().includes(value))
        );
        setIsOpen(value.length > 0);
    };

    const handleElementClick = (option: string) => {
        setName(option);
        setIsOpen(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            dropUpRef.current &&
            !dropUpRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    };

    return (
        <div className={`relative w-full my-1 ${position}`} ref={dropUpRef}>
            {isOpen && (
                <div className={styles.dropUp}>
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((option, index) => (
                            <div
                                key={index}
                                className="p-2 hover:bg-gray-200 cursor-pointer"
                                onClick={() => handleElementClick(option)}
                            >
                                {option}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-gray-500">
                            No results found
                        </div>
                    )}
                </div>
            )}
            <input
                type="text"
                value={name}
                onChange={handleInputChange}
                placeholder="To"
                className="w-full h-full p-2 border border-gray-300 rounded text-sm lg:text-base"
            />
        </div>
    );
}

export default SeacrchDropUp;
