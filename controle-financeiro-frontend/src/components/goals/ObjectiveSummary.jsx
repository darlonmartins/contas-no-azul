import React from "react";
import { Card, CardContent } from "../ui/card"; // caminho correto

const ObjectiveSummary = () => {
  // Estes dados podem vir de props, contexto ou API futuramente
  const totalObjectives = 5;
  const achievedObjectives = 3;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-2">Resumo dos Objetivos</h2>
        <div className="text-sm text-muted-foreground mb-1">
          Objetivos Cadastrados: <span className="font-medium text-foreground">{totalObjectives}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Objetivos Cumpridos: <span className="font-medium text-green-600">{achievedObjectives}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ObjectiveSummary;
