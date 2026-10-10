# RimbaQuest Wildlife Card Battle Game Design

## Purpose

Wildlife Card Battle turns the animals collected in RimbaQuest into a short, repeatable learning game for children aged 9-12. The design links outdoor discovery, animal collection cards, quizzes and battle play so that children are rewarded for learning about Malaysian wildlife rather than simply collecting static cards.

The feature is designed around four goals:

| Goal | Design Response |
| --- | --- |
| Encourage continued exploration | Battles are unlocked through collected animal cards, so discovery feeds directly into play. |
| Make learning feel earned | Card abilities are unlocked through species quizzes before they can be used in battle. |
| Keep matches child-friendly | Battle actions use simple names, clear HP/Energy feedback and short expected match length. |
| Preserve wildlife relevance | Animal roles, ability names and effects are derived from species traits and fun-fact validation evidence. |

## Player Journey

1. The child explores outdoors and captures an animal through the discovery flow.
2. The captured animal becomes a wildlife collection card.
3. The child reviews the animal card, fun facts and battle stats.
4. The child completes ability quizzes to unlock extra battle abilities.
5. The child enters Card Battle and chooses one available animal card.
6. The system selects a habitat arena and opponent.
7. The child uses Basic Attack or unlocked abilities to reduce the opponent's HP.
8. After the match, the used card rests before it can be used again, encouraging the child to try other animals.

## Core Battle Loop

Each battle is a turn-based card fight between two animal cards. A card has HP, Energy, a Basic Attack and up to three unlockable abilities.

| Element | Rule |
| --- | --- |
| HP | Represents the animal card's stamina in battle. A card loses when HP reaches 0. |
| Energy | Starts at 5 and has a maximum of 8. Energy pays for abilities. |
| Basic Attack | Always available and costs 0 Energy. |
| Ability 1 | Costs 1 Energy and is unlocked through the first ability quiz. |
| Ability 2 | Costs 2 Energy and is unlocked through the second ability quiz. |
| Ability 3 | Costs 4 Energy and is converted from the species' passive trait into an active special move. |
| Recharge | After acting, the card restores 2 Energy, up to the maximum of 8. |
| Win Condition | The first card to reduce the opponent's HP to 0 wins. |

This energy design replaces the older dice-driven concept. The intent is to give children simple tactical choices: use a free basic attack, spend Energy on a smaller skill, or save for a stronger special move.

## Game Modes

| Mode | Description |
| --- | --- |
| Bot Battle | The child battles a server-selected wildlife opponent. The AI chooses legal actions using the trained policy, with a safe heuristic fallback. |
| Friend Battle | The child can invite or join another explorer. Friend battles use turn deadlines and can update friend leaderboard points. |

The same server-authoritative battle rules are used for both modes.

## Card Selection and Rest

Only discovered animal cards can be selected for battle. After a card is used in a completed battle, it enters a rest period before it can be reused. This prevents children from relying on one strong card and supports collection variety.

| Design Choice | Reason |
| --- | --- |
| Card rest after battle | Encourages children to use different collected animals. |
| Habitat match shown during selection | Helps children connect animal habitats to battle advantage. |
| Locked cards and abilities visible | Makes progression clear without hiding future rewards. |

## Habitat Arenas

Battles occur in one of six habitat arenas:

| Habitat | Attack Bonus | Defence Bonus | Theme |
| --- | ---: | ---: | --- |
| Rainforest | +20% | +20% | Dense cover |
| Mangrove | +15% | +25% | Root maze |
| Wetland | +15% | +20% | Water movement |
| Grassland | +25% | +10% | Open ground |
| Coastal | +20% | +15% | Shoreline mobility |
| Montane | +10% | +25% | Highland endurance |

The system compares the battle arena with each species' natural habitat text. A matching card receives its habitat bonus for the whole match. Habitat selection prefers arenas where at least some of the player's available cards match and some do not, so choosing a card can matter.

## Animal Stats and Roles

Battle stats are stored in `backend/data/battle_catalogue.json` for all 152 active species.

| Stat | Current Runtime Range | Notes |
| --- | ---: | --- |
| HP | 74-104 | Shortened from the earlier range to reduce match length after playtesting. |
| Base Attack | 9-14 | Preserves distinct card roles and species feel. |
| Role | Agile, Control, Guardian, Power, Tank, Trickster | Used to preserve different tactical identities across the catalogue. |

The catalogue also preserves source values such as `source_hp`, `source_base_attack`, `source_effects` and `source_passive` so the team can trace how runtime balancing differs from the original generated ability data.

## Ability Design

Each animal has three battle abilities:

| Slot | Unlock Path | Cost | Design Intent |
| --- | --- | ---: | --- |
| 1 | Easy/early ability quiz | 1 Energy | Frequent low-cost move. |
| 2 | Medium ability quiz | 2 Energy | Stronger or more tactical move. |
| 3 | Hard ability quiz | 4 Energy | Signature special move derived from the species' passive trait. |

Ability names are intentionally short and child-friendly. The accepted naming set used during validation is:

`Mimic`, `Ambush`, `Forage`, `Camouflage`, `Reflex`, `Feint`, `Stalker`, `Defence`

Ability effects use a small set of understandable combat outcomes:

| Effect | Meaning |
| --- | --- |
| Damage | Reduces opponent HP. |
| Heal HP | Restores the user's HP up to max HP. |
| Shield | Absorbs incoming damage until depleted. |
| Guard | Reduces the next incoming hit by a percentage. |
| Block | Blocks a fixed amount from the next hit. |
| Boost | Increases the user's next attack. |
| Weaken | Reduces the opponent's next attack. |

The fun-fact validation audit confirms that all 456 ability rows have a biological cue at species level and no critical review-needed rows remain.

## Turn Resolution

On a player's turn:

1. The server checks legal actions based on turn ownership, unlocked abilities and available Energy.
2. The selected action is resolved server-side.
3. Damage is modified by boost/weaken, habitat attack bonus, block, guard, habitat defence bonus and shield.
4. Non-damage utility effects are applied.
5. The acting card recharges 2 Energy.
6. If the opponent has 0 HP, the match completes. Otherwise, the turn changes sides.

Friend battle timeouts skip the turn without damage or Energy recharge. Forfeits complete the match immediately.

## Balance Targets

After playtesting, battles were found to take too long. The current tuning shortens matches while keeping role win rates inside a safe range.

| Balance Metric | Target |
| --- | --- |
| Mean simulated battle length | 6.5-8.5 rounds |
| 95th percentile battle length | 10 rounds or fewer |
| Role win-rate band | 40%-60% |
| Overall tier mean win rate | 40%-60% |

The current simulator result from the latest tuning pass is:

| Metric | Result |
| --- | ---: |
| Mean rounds | 7.64 |
| 95th percentile rounds | 10 |
| Overall tier mean | 0.532 |
| Role win-rate range | 0.469-0.598 |
| Outliers | 0 |

Opening shield values were also reduced to support shorter battles:

| Highest Unlocked Ability Slot | Opening Shield for Second Mover |
| ---: | ---: |
| 0 | 3 |
| 1 | 7 |
| 2 | 8 |
| 3 | 10 |

## AI Opponent

Bot battles use the server AI to choose legal moves. The AI policy is stored in `backend/data/wildlife_ai_policy.json`, and `backend/tools/train_wildlife_ai.py` documents how the policy can be trained and evaluated. If the trained policy cannot choose an action, the service falls back to legal rule-based action selection.

## User Interface Design

The battle UI is designed to be readable during quick play:

| UI Area | Purpose |
| --- | --- |
| Lobby | Start bot battle, create/join friend battle, view friends and leaderboard. |
| Card Picker | Shows usable cards, habitat match and rest status before selection. |
| Arena | Shows both animal cards, HP, Energy, shield, habitat bonus and available moves. |
| Move Cards | Show cost, lock status and action text. Locked moves explain that quizzes unlock them. |
| Results | Shows win/loss state and leaderboard impact for friend matches. |

## Implementation Map

| Area | File |
| --- | --- |
| Battle catalogue and validation | `backend/data/battle_catalogue.json`, `backend/app/services/battle_catalogue.py` |
| Core wildlife battle rules | `backend/app/services/wildlife_battle.py` |
| Opponent matching | `backend/app/services/battle_matching.py` |
| Match API, rest, invites, leaderboard | `backend/app/routers/wildlife_matches.py` |
| Ability unlock lookup | `backend/app/services/battle_engine.py` |
| AI policy and training | `backend/data/wildlife_ai_policy.json`, `backend/tools/train_wildlife_ai.py` |
| Frontend battle experience | `rimbaquest/src/components/screens/wildlifeBattle/WildlifeBattleExperience.tsx` |
| Battle UI components | `rimbaquest/src/components/screens/wildlifeBattle/arena/` |
| Frontend battle types | `rimbaquest/src/types/wildlifeMatch.ts` |
| Collection battle stats and quiz unlock UI | `rimbaquest/src/components/screens/collection/` |
| Ability validation evidence | `backend/reports/battle_ability_fun_fact_validation_summary.md`, `backend/reports/battle_ability_fun_fact_validation.csv` |

## Test Coverage

| Test File | Coverage |
| --- | --- |
| `backend/tests/test_battle_catalogue.py` | Catalogue shape, DB species sync and validation. |
| `backend/tests/test_battle_catalogue_v2.py` | Runtime stat bounds, source provenance and habitat bonus contract. |
| `backend/tests/test_battle_matching.py` | Opponent selection, unlock mirroring and catalogue-wide matching. |
| `backend/tests/test_wildlife_engine.py` | Core battle rules, habitat bonuses and opening shield behaviour. |
| `backend/tests/test_wildlife_matches.py` | Match API behaviour, card selection, rest, invites and action flow. |
| `backend/tests/test_battle_balance_sim.py` | Reproducible balance simulation across pilot species, unlock tiers and initiatives. |
| `backend/tests/test_battle_rules_v2.py` | Battle rule regression checks. |
| `backend/tests/test_battle_regressions.py` | Specific regression protection for known battle issues. |

## Current Design Risks and Future Improvements

| Risk or Improvement Area | Proposed Follow-up |
| --- | --- |
| Some ability names are abstractions rather than literal fun-fact wording | Keep the CSV traceability file and optionally strengthen `IMPLIED_BY_GENERAL_SPECIES_BASIS` rows in later iterations. |
| Quiz quality affects ability unlock fairness | Continue planned Iteration 3 quiz source validation and difficulty-level review. |
| Battle length may differ from simulator in real child play | Use user testing to compare actual average match duration against simulator targets. |
| Strong cards could still dominate in narrow matchups | Expand simulation from the pilot fixture to broader all-species pairing samples. |
| Friend battle pacing depends on turn deadlines | Tune deadline length after real friend-battle observation. |

