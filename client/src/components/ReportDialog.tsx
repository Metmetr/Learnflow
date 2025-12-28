import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ReportDialogProps {
    contentId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function ReportDialog({ contentId, open, onOpenChange }: ReportDialogProps) {
    const [reason, setReason] = useState<string>("");
    const [description, setDescription] = useState("");
    const { toast } = useToast();

    const reportMutation = useMutation({
        mutationFn: async () => {
            const fullReason = description ? `${reason}: ${description}` : reason;
            await apiRequest("POST", "/api/reports", {
                contentId,
                reason: fullReason,
            });
        },
        onSuccess: () => {
            toast({
                title: "Rapor Gönderildi",
                description: "Geri bildiriminiz için teşekkürler. İncelendikten sonra gerekli işlem yapılacaktır.",
            });
            onOpenChange(false);
            setReason("");
            setDescription("");
        },
        onError: () => {
            toast({
                title: "Hata",
                description: "Rapor gönderilemedi. Lütfen daha sonra tekrar deneyin.",
                variant: "destructive",
            });
        },
    });

    const handleSubmit = () => {
        if (!reason) return;
        reportMutation.mutate();
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>İçeriği Raporla</DialogTitle>
                    <DialogDescription>
                        Bu içeriği neden raporlamak istediğinizi belirtin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sebep</label>
                        <Select value={reason} onValueChange={setReason}>
                            <SelectTrigger>
                                <SelectValue placeholder="Bir sebep seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="spam">Spam veya Yanıltıcı</SelectItem>
                                <SelectItem value="inappropriate">Uygunsuz İçerik</SelectItem>
                                <SelectItem value="harassment">Taciz veya Zorbalık</SelectItem>
                                <SelectItem value="other">Diğer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Açıklama (İsteğe bağlı)</label>
                        <Textarea
                            placeholder="Daha fazla detay ekleyin..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!reason || reportMutation.isPending}
                    >
                        {reportMutation.isPending && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Raporla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
