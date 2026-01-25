import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Globe } from "lucide-react";
import type { User } from "@/types";
import { useTranslation } from "react-i18next";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import i18n from "@/i18n";

interface ProfileTabProps {
    user: User | null;
    settingsName: string;
    setSettingsName: (val: string) => void;
    settingsAgencyName: string;
    setSettingsAgencyName: (val: string) => void;
    settingsAvatar: string;
    setSettingsAvatar: (val: string) => void;
    isSavingSettings: boolean;
    handleUpdateProfile: () => void;
}

export function ProfileTab({
    user,
    settingsName,
    setSettingsName,
    settingsAgencyName,
    setSettingsAgencyName,
    settingsAvatar,
    setSettingsAvatar,
    isSavingSettings,
    handleUpdateProfile
}: ProfileTabProps) {
    const { t } = useTranslation();

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };
    return (
        <Card className="bg-zinc-900/20 border-zinc-800/50 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold text-white">{t("profile.title")}</CardTitle>
                <CardDescription>{t("profile.subtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid gap-4">
                    <Label className="text-zinc-400">{t("profile.agency_name")}</Label>
                    <Input
                        value={settingsAgencyName}
                        onChange={(e) => setSettingsAgencyName(e.target.value)}
                        className="bg-black/50 border-zinc-800 focus:ring-blue-500/50 text-white"
                    />
                </div>
                <div className="flex items-center gap-6">
                    <Avatar className="h-20 w-20 border-2 border-zinc-800">
                        <AvatarImage src={settingsAvatar} />
                        <AvatarFallback className="bg-zinc-800 text-xl text-zinc-400">
                            {user?.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                        <Label className="text-xs text-zinc-400 uppercase">
                            {t("profile.avatar_url")}
                        </Label>
                        <Input
                            value={settingsAvatar}
                            onChange={(e) => setSettingsAvatar(e.target.value)}
                            placeholder="https://..."
                            className="bg-zinc-950/50 border-zinc-800 text-sm text-white"
                        />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-zinc-400">{t("profile.manager_name")}</Label>
                        <Input
                            value={settingsName}
                            onChange={(e) => setSettingsName(e.target.value)}
                            className="bg-black/50 border-zinc-800 text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-zinc-400">{t("profile.contact_email")}</Label>
                        <Input
                            value={user?.email || ""}
                            disabled
                            className="bg-black/50 border-zinc-800 opacity-50 text-white"
                        />
                    </div>
                </div>

                <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-zinc-500" />
                        <h3 className="text-sm font-bold text-zinc-300">{t("common.language")}</h3>
                    </div>
                    <Select value={i18n.language} onValueChange={changeLanguage}>
                        <SelectTrigger className="w-full bg-black/50 border-zinc-800 text-white h-12 rounded-xl">
                            <SelectValue placeholder={t("common.language")} />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                            <SelectItem value="en">{t("languages.en")}</SelectItem>
                            <SelectItem value="pt">{t("languages.pt")}</SelectItem>
                            <SelectItem value="es">{t("languages.es")}</SelectItem>
                            <SelectItem value="fr">{t("languages.fr")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Button
                    onClick={handleUpdateProfile}
                    disabled={isSavingSettings}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl mt-6 shadow-lg shadow-blue-900/20"
                >
                    {isSavingSettings ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        <Save className="w-4 h-4 mr-2" />
                    )}
                    {t("profile.save_btn")}
                </Button>
            </CardContent>
        </Card>
    );
}
