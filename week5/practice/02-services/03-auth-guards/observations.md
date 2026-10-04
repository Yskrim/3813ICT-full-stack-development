|       | /channels           | /admin              | change user role in localstorage                |
| ----- | ------------------- | ------------------- | ----------------------------------------------- |
| guest | redirects to /login | redirects to /login | need to write a whole record with 'superadmin'  |
| alice | opens channels      | shows admin link    | not needed                                      |
| ben   | opens channels      | shows basic ui      | can change role to 'superadmin' shows admin tab |
| super | opens channels      | shows admin link    | not needed                                      |
