# ChatAVB (working title)

ChatAVB is a chat application that allows users to "chat" with the AVB (Allgemeine Vertragsbedingungen) of an insurance
product.
This solution is meant to help people better understand what they really get when they sign up for a particular insurance
product.

Oftentimes, people have a specific need in mind when they look for an insurance project (e.g. insure furniture against 
damage from pets). However, often it is unclear whether the given insurance product actually covers this specific need,
and it can be difficult to find out. This is where ChatAVB comes in.

The application helps the user choose the specific product that covers the cases that they want to insure against,
so that the user does not have to read pages upon pages of legal text to find out if their specific case is covered.

## How to run it

The application is continuously built and deployed to our Kubernetes cluster. The staging environment is available at
[https://baselhack-staging.rovner.ch/](https://baselhack-staging.rovner.ch/) and the production environment is available at
[https://baselhack-prod.rovner.ch/](https://baselhack-prod.rovner.ch/).

If you want to run an application build locally, you can do so by simply running one of our [Docker images](https://github.com/snophey/baselhack_2024/pkgs/container/baselhack_2024).

### Configuration

The application is configured using environment variables. The following environment variables are available:

| Variable | Description | Required |
| --- | --- | --- |
| `PORT` | The port the application should listen on | No, defaults to `8000` |
| `DB_PATH` | The path to the SQLite database file | No, defaults to `/usr/share/app/data` |
| `OPENAI_API_KEY` | The API key for the OpenAI API | Yes |
| `SEARCH_API_KEY` | Azure API key | Yes |


## How to develop locally

More information on how to develop locally can be found in the [code documentation](../code/app/README.md).
