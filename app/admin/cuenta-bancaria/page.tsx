"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useEffect, useState, useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface Balance {
    totalIngresos: number
    totalEgresos: number
    balance: number
    balanceUsd?: number
}

export default function cuentaBancaria() {
    const [balance, setBalance] = useState<Balance>({
        totalIngresos: 0,
        totalEgresos: 0,
        balance: 0,
        balanceUsd: 0,
    });
    const [isLoading, setIsLoading] = useState(false);
    useEffect(() => {
        fetchAllData()
    }, [])

    const fetchAllData = async () => {
        setIsLoading(true)
        try {
            const balanceRes = await fetch("/api/admin/balance")
            const balanceData = await balanceRes.json()
            setBalance(balanceData)
        } catch (error) {
            console.error("Error fetching data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="bg-muted/30">
            <main className="p-8">

                <div className="max-w-7xl mx-auto space-y-8">

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <Card key={i}>
                                    <CardHeader className="pb-2">
                                        <Skeleton className="h-4 w-24" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-8 w-32 mb-2" />
                                        <Skeleton className="h-3 w-20" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Ingresos</CardTitle>
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    ${balance.totalIngresos.toLocaleString("es-AR")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Pagos recibidos</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Total Egresos</CardTitle>
                                <TrendingDown className="w-4 h-4 text-red-600" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-foreground">
                                    ${balance.totalEgresos.toLocaleString("es-AR")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Gastos registrados</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                                <DollarSign className="w-4 h-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${balance.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
                                >
                                    ${balance.balance.toLocaleString("es-AR")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {balance.balance >= 0 ? "Superávit" : "Déficit"}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
                                <DollarSign className="w-4 h-4 text-blue-600" />
                            </CardHeader>
                            <CardContent>
                                <div
                                    className={`text-2xl font-bold ${balance.balanceUsd && balance.balanceUsd >= 0 ? "text-emerald-600" : "text-red-600"}`}
                                >
                                    ${balance.balanceUsd && balance.balanceUsd.toLocaleString("es-AR")}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {balance.balanceUsd && balance.balanceUsd >= 0 ? "Superávit" : "Déficit"}
                                </p>
                            </CardContent>
                        </Card>
                    </div>)}
                </div>
            </main>
        </div>
    )
}