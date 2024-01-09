import "./Sidebar.css"
import React from "react";
import { SidebarData } from "./SidebarData";
import { useNavigate } from "react-router-dom";

function Sidebar() {
	const navigate = useNavigate();

	return (
		<div className="Sidebar">
			<ul className="SidebarList">
				{SidebarData.map((val, key) => (
					<li
						className="row"
						id={window.location.pathname === val.path ? "active" : ""}
						key={key}
						onClick={() => {
							navigate(val.path);
						}}
					>
						<div className="title"> {val.title} </div>
					</li>
				))}
			</ul>
		</div>
	);
}

export default Sidebar;
