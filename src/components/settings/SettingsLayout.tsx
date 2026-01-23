import { useState } from "react";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { NotificationsTab } from "./NotificationsTab";
import { TeamTab } from "./TeamTab";
import { PlansTab } from "./PlansTab";
import type { User } from "@/types";
import { User as UserIcon, Shield, Bell, Users, Settings, CreditCard } from "lucide-react";

interface SettingsLayoutProps {
    user: User | null;
    settingsName: string;
    setSettingsName: (val: string) => void;
    settingsAgencyName: string;
    setSettingsAgencyName: (val: string) => void;
    settingsAvatar: string;
    setSettingsAvatar: (val: string) => void;
    isSavingSettings: boolean;
    handleUpdateProfile: () => void;
    plan: "starter" | "pro" | "agency";
    usage: { projects: number; storage: number };
}

type TabType = "perfil" | "planos" | "seguranca" | "notificacoes" | "equipe";

export function SettingsLayout({
    user,
    settingsName,
    setSettingsName,
    settingsAgencyName,
    setSettingsAgencyName,
    settingsAvatar,
    setSettingsAvatar,
    isSavingSettings,
    handleUpdateProfile,
    plan = "starter",
    usage = { projects: 0, storage: 0 }
}: SettingsLayoutProps) {
    const [activeTab, setActiveTab] = useState<TabType>("perfil");

    const tabs = [
        { id: "perfil", label: "Perfil da Agência", icon: UserIcon },
        { id: "planos", label: "Meus Planos", icon: CreditCard },
        { id: "seguranca", label: "Segurança & Login", icon: Shield },
        { id: "notificacoes", label: "Notificações", icon: Bell },
        { id: "equipe", label: "Equipe & Permissões", icon: Users },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case "perfil":
                return (
                    <ProfileTab
                        user={user}
                        settingsName={settingsName}
                        setSettingsName={setSettingsName}
                        settingsAgencyName={settingsAgencyName}
                        setSettingsAgencyName={setSettingsAgencyName}
                        settingsAvatar={settingsAvatar}
                        setSettingsAvatar={setSettingsAvatar}
                        isSavingSettings={isSavingSettings}
                        handleUpdateProfile={handleUpdateProfile}
                    />
                );
            case "planos":
                return <PlansTab currentPlan={plan} usage={usage} />;
            case "seguranca":
                return <SecurityTab />;
            case "notificacoes":
                return <NotificationsTab />;
            case "equipe":
                return <TeamTab currentUser={user} />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 animate-in fade-in">
            <div className="mb-8 ml-1">
                <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800">
                        <Settings className="h-6 w-6 text-zinc-400" />
                    </div>
                    Configurações
                </h2>
                <p className="text-zinc-500 mt-2 ml-14">Gerencie sua conta, preferências e membros da equipe.</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* SETTINGS SIDEBAR NAV */}
                <div className="w-full lg:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as TabType)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id
                                ? "bg-white text-black shadow-lg shadow-white/5 scale-[1.02]"
                                : "text-zinc-500 hover:text-white hover:bg-zinc-900/50"
                                }`}
                        >
                            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-black" : ""}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="flex-1 space-y-6">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
}
