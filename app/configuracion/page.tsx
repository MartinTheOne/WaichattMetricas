"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Crown, Zap, Building } from "lucide-react"

const plans = [
  {
    id: "inicial",
    name: "Plan Inicial",
    price: "$29",
    period: "/mes",
    description: "Perfecto para pequeños negocios",
    icon: Zap,
    features: ["1,000 mensajes por mes", "Soporte básico", "Integración WhatsApp", "Dashboard básico"],
    current: false,
  },
  {
    id: "pro",
    name: "Plan Pro",
    price: "$79",
    period: "/mes",
    description: "Ideal para empresas en crecimiento",
    icon: Crown,
    features: [
      "5,000 mensajes por mes",
      "Soporte prioritario",
      "Integración WhatsApp",
      "Dashboard avanzado",
      "Automatizaciones",
      "Reportes detallados",
    ],
    current: true,
    popular: true,
  },
  {
    id: "empresarial",
    name: "Plan Empresarial",
    price: "$199",
    period: "/mes",
    description: "Para grandes organizaciones",
    icon: Building,
    features: [
      "20,000 mensajes por mes",
      "Soporte 24/7",
      "Integración WhatsApp",
      "Dashboard empresarial",
      "Automatizaciones avanzadas",
      "Reportes personalizados",
      "API completa",
      "Gestor de cuenta dedicado",
    ],
    current: false,
  },
]

export default function ConfiguracionPage() {
  const [selectedPlan, setSelectedPlan] = useState("pro")

  const handlePlanChange = (planId: string) => {
    setSelectedPlan(planId)
    // Aquí implementarías la lógica para cambiar el plan
    console.log("Cambiando a plan:", planId)
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Actual</CardTitle>
            <CardDescription>Gestiona tu suscripción y cambia de plan cuando lo necesites</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
              <div className="flex items-center space-x-4">
                <div className="bg-primary p-2 rounded-lg">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Plan Pro</h3>
                  <p className="text-sm text-muted-foreground">5,000 mensajes por mes</p>
                </div>
              </div>
              <Badge className="bg-primary">Activo</Badge>
            </div>
          </CardContent>
        </Card>

        <div>
          <h3 className="text-xl font-semibold mb-4">Cambiar Plan</h3>
          <div className="grid gap-6 md:grid-cols-3">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.id}
                  className={`relative ${
                    plan.popular ? "border-primary shadow-lg" : ""
                  } ${selectedPlan === plan.id ? "ring-2 ring-primary" : ""}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary">Más Popular</Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 rounded-full ${plan.current ? "bg-primary" : "bg-gray-100"}`}>
                        <Icon className={`h-6 w-6 ${plan.current ? "text-white" : "text-gray-600"}`} />
                      </div>
                    </div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Check className="h-4 w-4 text-primary" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className="w-full"
                      variant={plan.current ? "secondary" : "default"}
                      disabled={plan.current}
                      onClick={() => handlePlanChange(plan.id)}
                    >
                      {plan.current ? "Plan Actual" : "Seleccionar Plan"}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Información de Facturación</CardTitle>
            <CardDescription>Tu próxima facturación será el 15 de febrero de 2024</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Plan Pro</h4>
                  <p className="text-sm text-muted-foreground">Mensual</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">$79.00</p>
                  <p className="text-sm text-muted-foreground">por mes</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span>Método de pago:</span>
                <span>•••• •••• •••• 4242</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
