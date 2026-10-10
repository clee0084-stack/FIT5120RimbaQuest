// Text helpers shared by the battle screens.
import { Share } from "react-native";
import { WildlifeEvent } from "../../../../types/wildlifeMatch";

export type HabitatBonus = {
  attack_percent: number;
  defence_percent: number;
  theme?: string;
};

const HABITAT_BONUSES: Record<string, HabitatBonus> = {
  Rainforest: { attack_percent: 20, defence_percent: 20 },
  Mangrove: { attack_percent: 15, defence_percent: 25 },
  Wetland: { attack_percent: 15, defence_percent: 20 },
  Grassland: { attack_percent: 25, defence_percent: 10 },
  Coastal: { attack_percent: 20, defence_percent: 15 },
  Montane: { attack_percent: 10, defence_percent: 25 },
};

/** "wet_land" -> "Wet Land". */
export function friendlyHabitat(habitat: string): string {
  return habitat
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function habitatBonusFor(habitat: string): HabitatBonus | null {
  return HABITAT_BONUSES[habitat] ?? null;
}

export function habitatBonusSummary(
  habitat: string,
  bonus: HabitatBonus | null | undefined = habitatBonusFor(habitat),
): string {
  const label = habitat === "Rainforest" ? "Forest" : friendlyHabitat(habitat);
  if (!bonus) return `${label} bonus`;
  return `${label} ${habitatBonusEffectText(habitat, bonus)}`;
}

export function habitatBonusEffectText(
  habitat: string,
  bonus: HabitatBonus | null | undefined = habitatBonusFor(habitat),
): string {
  if (!bonus) return "a habitat bonus";
  return `+${bonus.attack_percent}% ATK, -${bonus.defence_percent}% DMG`;
}

/** Newest first, de-duplicated, without the Energy recharge chatter. */
export function recentEvents(
  events: WildlifeEvent[] | undefined,
  limit = 6,
): WildlifeEvent[] {
  const seen = new Set<number>();
  return (events ?? [])
    .filter((event) => {
      if (event.type === "recharge") return false;
      if (event.id === undefined) return true;
      if (seen.has(event.id)) return false;
      seen.add(event.id);
      return true;
    })
    .slice(-limit)
    .reverse();
}

/** Opens the phone's share sheet with a battle invitation code. */
export function shareInviteCode(code: string) {
  void Share.share({
    message: `Battle me in RimbaQuest! Open Card Battle, tap Challenge a Friend and enter code ${code}.`,
  }).catch(() => {});
}
