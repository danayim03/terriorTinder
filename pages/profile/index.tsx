import React from "react";
import s from './profile.module.scss';
import { useAuth } from "@/context/authcontext";
import Button from "@/components/button/button";


export default function Profile() {
	
	const { user, logout } = useAuth();
	
	return (
		<section className={s.profile}>
			<div className={s.content}>
				<h1>Profile</h1>
				<Button onClick={logout} text="Logout" />
			</div>
		</section>
	);
}