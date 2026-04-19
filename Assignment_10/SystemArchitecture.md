# Elder Fraud Protection Architecture

! [Diagram 1](Diagram1.png)
The Diagram starts with the UI component allowing the user to scan either their outlook or gmail email.
The scanning itself is done by the frontend which sends this info through our API to the backend.
It gets stored as a piece of data and gets analyzed by our AI to see if it is spam or not, that result is then sent back to the user.

! [Diagram 2](Diagram2.png)
The Diagram describes the info stored in our database. For the time being we only plan to store email text that has been scanned by the user so that we may train our AI model using that data in the future.
