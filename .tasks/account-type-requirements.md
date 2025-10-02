# Problem statement

Currently, the investment schema does not track whether the investment was made from is a taxable or IRA account. This is resulting in recommendations from AI that may falsely associate tax implecations with the sale of a investment that don't actually exist. We should update the payload schema, frontend UI, and the requests to AI to include this relevant data.

# Action steps

## Task 1: Support account type in payload

- **1.1** Add investment type selection to Investment.ts payload schema. This should be a dropdown value so it is future proof. The first 2 account types should be taxable and IRA. (DONE)
- **1.2** I am using payload CMS with postgres so make sure the postgres schema is updated correctly. Use any drizzle commands you know to do schema validation and update. If payload updates the schema in dev mode on server start up prompt me to go in to trigger that to happen so we can move forward. This task is not done until the database can successfully store this new account type field. (DONE)

## Task 2: Update the frontend

- **2.1** Add UI to the transactions section that shows which account type the buy or sell happened in. If there is no data default to the taxable account type. Ensuring that it looks good with what exists already

## Task 3: Update the AI Service

- **3.1** Update ai-service.ts to add the account type to the request. If there is no account type present or there are investments in multiple account types update the prompt to give a holistic overview based on the different account types.

# Final Instructions

1. Keep this file up to date by writing `(STARTED)` next to the steps you have started and `(DONE)` next to the tasks that you have completed.
2. After each step ensure you run `npm run dev` to make sure there are no errors and then stop that command once it starts without any errors.
3. Each task should have a commit message so run `git commit -m ` followed by the commit message after each task to ensure the work is tracked.
