# Overview
This read me contains information on how to run the yoga studio management software, used to manage yoga studio operations i.e adding courses and sessions.

# Local Run
When running the application ensure your in the root of the repo.

1. Install dependencies 

```bash
npm install --include=dev
```

2. Add .env file to route of the repo

### Example .env 

```
ACCESS_TOKEN_SECRET=
NODE_ENV=test
```

3. Run application

```bash
npm run start
```

4. Navigate to site

```
http://localhost:3000
```


# Debug application (VSCODE)

1. Install dependencies 

```bash
npm install --include=dev
```

2. Add .env file to route of the repo

### Example .env 

```
ACCESS_TOKEN_SECRET=
NODE_ENV=test
```

3. In vscode select run -> debug -> node.js (configuration)

4. Go to Debug Console to view console logs

5. Navigate to site

```
http://localhost:3000
```

# Access Deployed Website

1. Navigate to deployed site url

```
https://wad2-coursework-fivj.onrender.com/
```

# Features Implemented
The current yoga application includes the following features:

- Non logged in users can:
    - Access home page with an overview of the organisation, its coures & classes.
    - View details of current and upcoming courses, including:
        - Course name and duration
        - Date and time of each class
        - Description of the class
        - Location of the class
        - Price of the class

- Registered users can:
    - Enrol in a course.
    - Book attendance at a class/session.
    - View the same information as non users

- Organisers/admin can:
    - Log in to the system.
    - Add new courses and classes.
    - Delete courses and classes.
    - Update details of any class for a given course.
    - Generate class lists with participants names.
    - Add or delete organisers.
    - Promote or demote users roles
    - Remove users.


## Additonals 

- Paginated coures page and admin courses page
- Simple filters
- Admin Dashboard & Quick actions