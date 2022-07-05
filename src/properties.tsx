import "./properties.sass";
import * as React from "react";
import {mdiChevronUp, mdiChevronDown} from "@mdi/js";
import {Icon} from "@mdi/react";

export interface ItemProps {
    label: string;
    left: string;
    right: string;
}

function renderItem({label, left, right}: ItemProps) {
    return <li key={label}>
        <div className="header">{label}</div>
        <div>
            <span>{left}</span>
            <span>{right}</span>
        </div>
    </li>;
}

interface Props {
    items: ReadonlyArray<ItemProps> | null;
    leftFile: string;
    rightFile: string;
}

function renderProperties({items, leftFile, rightFile}: Props) {
    const [collapsed, setCollapsed] = React.useState(false);
    return <div className="properties">
        <div className="header">
            <button className="handle" onClick={() => setCollapsed(!collapsed)}>
                <Icon path={collapsed ? mdiChevronUp : mdiChevronDown} />
            </button>
        </div>
        {!collapsed && <div className="layer">
            <div className="panel">
                <ul>
                    {items
                        ? items.map(renderItem)
                        : <li><div className="label">Loading...</div></li>}
                    <li>
                        <div>
                            <span>{leftFile}</span>
                            <span>{rightFile}</span>
                        </div>
                    </li>
                </ul>
            </div>
        </div>}
    </div>;
}

export const Properties = React.memo(renderProperties);