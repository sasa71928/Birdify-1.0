# Add verification badge to feed

## Goal Description

Display a verified badge (checkmark‑circle icon) next to the username in the feed, matching the app’s color palette and design language, and ensure the badge appears only for posts where `post.isVerified` is true.

## User Review Required

- **Design preference**: Do you want the badge to be larger, a different color, or have a tooltip?  
- **Data source**: Confirm that the API returning feed posts includes the boolean `isVerified` field for each post.

## Open Questions

> [!IMPORTANT]
> Is the current `post.isVerified` flag reliably set on the backend, or do we need to modify the data fetching logic?

> [!IMPORTANT]
> Do you prefer any animation (e.g., a subtle pulse) for the verified icon?

## Proposed Changes

---
### FeedItem Component

- **[MODIFY]** `c:/Users/IVÁN/Birdify-1.0/BirdifyApp/src/components/FeedItem.tsx`
  - Update the import for `Ionicons` to include a specific size/color if needed.
  - Refactor the username block to wrap the username and badge in a dedicated container for better alignment.
  - Add a conditional tooltip (optional) using `Tooltip` from `react-native-elements` if the user wants it.

---
### Styles

- **[MODIFY]** `c:/Users/IVÁN/Birdify-1.0/BirdifyApp/src/styles/components/FeedItem.styles.ts`
  - Adjust `verifiedIcon` style:
    ```ts
    verifiedIcon: {
      marginLeft: 6,
      // Slightly larger for prominence
      // size is set via component props, color matches primary accent
    },
    ```
  - Ensure `nameRow` aligns items centrally:
    ```ts
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    ```

---
### Data Layer (optional)

If the backend does not yet return `isVerified`, modify the repository fetching posts to map the field accordingly.

---
## Verification Plan

### Automated Tests
- Run the existing Jest/React‑Native test suite to ensure no regressions.
- Add a snapshot test for `FeedItem` where `isVerified` is true and false.

### Manual Verification
- Launch the app on Android/iOS and verify that posts marked as verified display the badge correctly next to the username.
- Confirm that unverified posts show no badge.
