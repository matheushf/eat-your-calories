import { useState, useTransition, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { startSeason, endSeason, getSeasons } from "@/app/actions/season";

type Season = {
  id: string;
  type: "cutting" | "bulking";
  started_at: string;
  ended_at: string | null;
};

export function SeasonSection() {
  const [cuttingDate, setCuttingDate] = useState("");
  const [bulkingDate, setBulkingDate] = useState("");
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    (async () => {
      const res = await getSeasons();
      setSeasons(res.seasons || []);
    })();
  }, []);

  const handleStart = (type: "cutting" | "bulking", date: string) => {
    startTransition(async () => {
      const res = await startSeason({ type, date });
      if (res.success) {
        const updated = await getSeasons();
        setSeasons(updated.seasons || []);
        if (type === "cutting") setCuttingDate("");
        if (type === "bulking") setBulkingDate("");
      } else {
        alert(res.error || `Failed to start ${type} season`);
      }
    });
  };

  const handleEnd = (type: "cutting" | "bulking") => {
    startTransition(async () => {
      const res = await endSeason({ type });
      if (res.success) {
        const updated = await getSeasons();
        setSeasons(updated.seasons || []);
      } else {
        alert(res.error || `Failed to end ${type} season`);
      }
    });
  };

  const openCutting = seasons.find((s) => s.type === "cutting" && !s.ended_at);
  const openBulking = seasons.find((s) => s.type === "bulking" && !s.ended_at);

  return (
    <Card className="flex flex-col gap-6 p-8">
      <h1 className="text-lg font-semibold">Season</h1>
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Cutting</h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={cuttingDate}
            onChange={(e) => setCuttingDate(e.target.value)}
            className="max-w-[180px]"
            disabled={isPending || !!openCutting}
          />
          <Button
            onClick={() => handleStart("cutting", cuttingDate)}
            disabled={!cuttingDate || isPending || !!openCutting}
          >
            Start
          </Button>
          {openCutting && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEnd("cutting")}
              disabled={isPending}
            >
              Stop
            </Button>
          )}
        </div>
        <div className="mt-2">
          {openCutting && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Started on:{" "}
                <span className="font-medium">{openCutting.started_at}</span>
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">History</h3>
          <ul className="text-sm text-muted-foreground">
            {seasons
              .filter((s) => s.type === "cutting" && s.ended_at)
              .map((s) => (
                <li key={s.id}>
                  Started: <span className="font-medium">{s.started_at}</span>{" "}
                  &rarr; Ended:{" "}
                  <span className="font-medium">{s.ended_at}</span>
                </li>
              ))}
            {seasons.filter((s) => s.type === "cutting" && s.ended_at)
              .length === 0 && <li>No past cutting seasons</li>}
          </ul>
        </div>
      </Card>
      <Card className="p-6 flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Bulking</h2>
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={bulkingDate}
            onChange={(e) => setBulkingDate(e.target.value)}
            className="max-w-[180px]"
            disabled={isPending || !!openBulking}
          />
          <Button
            onClick={() => handleStart("bulking", bulkingDate)}
            disabled={!bulkingDate || isPending || !!openBulking}
          >
            Start
          </Button>
          {openBulking && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEnd("bulking")}
              disabled={isPending}
            >
              Stop
            </Button>
          )}
        </div>
        <div className="mt-2">
          {openBulking && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Started on:{" "}
                <span className="font-medium">{openBulking.started_at}</span>
              </span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">History</h3>
          <ul className="text-sm text-muted-foreground">
            {seasons
              .filter((s) => s.type === "bulking" && s.ended_at)
              .map((s) => (
                <li key={s.id}>
                  Started: <span className="font-medium">{s.started_at}</span>{" "}
                  &rarr; Ended:{" "}
                  <span className="font-medium">{s.ended_at}</span>
                </li>
              ))}
            {seasons.filter((s) => s.type === "bulking" && s.ended_at)
              .length === 0 && <li>No past bulking seasons</li>}
          </ul>
        </div>
      </Card>
    </Card>
  );
}
