"use client";

import { useState } from "react";
import {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function DeletePaymentDialog({
    onDelete,
    children,
    name,
    monto,
    loading
}: {
    onDelete: () => void;
    children: React.ReactNode;
    name: string;
    monto?: number;
    loading?: boolean;
}) {
    const [open, setOpen] = useState(false);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <div onClick={() => setOpen(true)}>
                {children}
            </div>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta acción eliminará el pago de el cliente {name} de ${monto} permanentemente.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                        onClick={() => {
                            onDelete();
                            setOpen(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                        disabled={loading}
                    >
                        Eliminar
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}