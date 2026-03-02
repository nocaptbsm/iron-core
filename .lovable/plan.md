

## Plan: Update Add Customer & Customers Pages

### 1. Update Customer interface (`src/lib/mockData.ts`)
- Add optional `photo?: string` field to `Customer` interface to store base64 photo data

### 2. Update Add Customer page (`src/pages/AddCustomer.tsx`)
- Remove the subscription plan `Select` dropdown entirely
- Remove `planDurations`, `endDate` calculation, and the end date display section
- Remove `plan` from form state; remove plan validation from submit
- Add a "Capture Photo" button that opens the device camera via `navigator.mediaDevices.getUserMedia`
- Show a modal/dialog with a live video feed and a "Take Photo" button
- Capture the frame to a canvas, convert to base64, store in form state
- Display a preview thumbnail of the captured photo
- Pass the photo to `addCustomer`; registration no longer requires a plan

### 3. Update GymContext (`src/context/GymContext.tsx`)
- Update `addCustomer` signature to accept the new `photo` field
- Add `deleteCustomer(id)` and `upgradeCustomer(id, plan)` methods
- `deleteCustomer`: removes customer from state and localStorage
- `upgradeCustomer`: updates the customer's plan and recalculates `subscriptionEnd` from today

### 4. Update Customers page (`src/pages/Customers.tsx`)
- Replace the `MoreHorizontal` ghost button with a `DropdownMenu` containing:
  - **Delete** option with an `AlertDialog` confirmation
  - **Upgrade** option that opens a dialog listing plan choices (1 month, 3 months, 6 months, 12 months)
- On delete confirmation, call `deleteCustomer(id)`
- On plan selection, call `upgradeCustomer(id, selectedPlan)`
- Show customer photo thumbnail in the avatar slot if available

### 5. Display photo in customer avatar
- In the Customers table, if `customer.photo` exists, render an `<img>` instead of the initials avatar

