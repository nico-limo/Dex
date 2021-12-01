import React, { useState } from "react";

const Dropdown = ({ onSelect, activeItem, items }) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const selectItem = (event, item) => {
        event.preventDefault();
        setDropdownVisible(!dropdownVisible);
        onSelect(item);
    };
    return (
        <div className="dropdown ml-3">
            <button
                className="btn btn-secondary dropdown-toggle"
                type="button"
                onClick={() => setDropdownVisible(!dropdownVisible)}
            >
                {activeItem.label}
            </button>
            <ul className={`dropdown-menu ${dropdownVisible ? "visible" : ""}`}>
                {items &&
                    items.map((item) => (
                        <li key={item.label}>
                            <a
                                className={`dropdown-item ${
                                    activeItem.value ? "active" : null
                                }`}
                                href="/#"
                                onClick={(e) => selectItem(e, item.value)}
                            >
                                {item.label}
                            </a>
                        </li>
                    ))}
            </ul>
        </div>
    );
};

export default Dropdown;
