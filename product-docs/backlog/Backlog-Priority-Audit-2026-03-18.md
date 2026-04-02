# Backlog Priority Audit - March 18, 2026

## Summary

On March 18, 2026, a bulk prioritization update was applied to all 484 user stories in the Lista ADO backlog. The update set two fields on every user story based on the story's associated milestone (determined by tracing each story's parent Feature → parent Epic):

| Field | Purpose |
|---|---|
| `Microsoft.VSTS.Common.StackRank` | Controls visual sort order on the ADO board/backlog view |
| `Microsoft.VSTS.Common.Priority` | Standard priority label (1=Critical, 2=High, 3=Medium, 4=Low) |

## Priority Mapping

| Milestone | StackRank | Priority | Meaning |
|---|---|---|---|
| Alpha | 100 | 1 | Critical - deliver first |
| Beta | 200 | 2 | High - deliver second |
| GA | 500 | 3 | Medium - deliver third |
| Untagged / Else | 900 | 4 | Low - not yet milestone-assigned |

## Results

| Milestone | Story Count | StackRank Applied | Priority Applied |
|---|---|---|---|
| Alpha | 291 | 100 | 1 |
| Beta | 128 | 200 | 2 |
| GA | 25 | 500 | 3 |
| Else (untagged) | 40 | 900 | 4 |
| **Total** | **484** | | |

## Methodology

1. **Story extraction** - All 484 active user story IDs were retrieved from the Lista team backlog via `wit_list_backlog_work_items`.
2. **Hierarchy mapping** - Stories were fetched in batches of 100 to retrieve their parent Feature IDs (`System.Parent`). Features were then fetched to retrieve their parent Epic IDs.
3. **Milestone classification** - Each story was classified by tracing Story → Feature → Epic, then matching the Epic ID against known Alpha, Beta, and GA epic lists sourced from the backlog definition.
4. **Bulk update** - Stories were updated in batches of 25 (50 operations per batch) via `wit_update_work_items_batch`, covering 21 total batch files.

## Epic Classification Reference

Milestone assignments were derived from the epic structure defined in:
- `product-docs/backlog/Lista-Backlog-Definition.md`
- `product-docs/backlog/Milestone_Statements_of_Scope.md`

Stories whose Feature or Epic could not be matched to a milestone epic were placed in the **Else** category (StackRank=900, Priority=4) to ensure they appear at the bottom of the backlog.

## Scope and Limitations

- This update establishes **milestone-level banding only**. Within each milestone band, stories retain their relative order from before this update.
- Phase 2 (finer prioritization within the Alpha block) is a separate follow-on exercise.
- Stories added after this date will not automatically receive these field values and should be manually assigned based on their milestone.

## Authorized By

- Aaron Jost, Product Manager, Lista
- Date: March 18, 2026
