# NAVBÄR

NAVBÄR is a chat application that allows users to "chat" with the AVB (Allgemeine Vertragsbedingungen) of the PAX insurance
products. We build upon the stored documents in German which we have extended to be searachble in English expanding the capabilities and attracted more international customers in Basel. 

This solution is meant to help people better understand what they really get when they sign up for a particular insurance
product. You can chat with our friendly chat tool NAVBÄR (navigating bear) so you can discover and better understand PAX life insurance products. 

Oftentimes, people have a specific need in mind when they look for life insurance (e.g is it covered by base jumping). However, often it is unclear whether the given insurance product actually covers this specific need,
and it can be difficult to find out. This is where NAVBÄR comes in.

The application helps the user choose the specific product that covers the cases that they want to insure against,
so that the user does not have to read pages upon pages of legal text to find out if their specific case is covered.

## Autobrainrot

We are building on top of [ShortGPT](https://github.com/RayVentura/ShortGPT). The repository was added locally since it had some key differences in order to run it locally. 

User needs to copy the entire [shortGPT folder](https://github.com/RayVentura/ShortGPT/tree/stable/shortGPT) into the ./autobrainrot/videoGeneration/shortGPT. Then you should be able to run it as expected. The below are the commands to do it in bash or can be done manually by the user. 

```bash
cd ./autobrainrot/videoGeneration/
```bash
# 1. Clone the repository without checking out files
git clone --no-checkout https://github.com/RayVentura/ShortGPT.git
cd ShortGPT

# 2. Enable sparse checkout
git config core.sparseCheckout true

# 3. Specify the folder to pull in the sparse-checkout file
echo "shortGPT/" >> .git/info/sparse-checkout

# 4. Check out the desired branch and pull the specified folder
git checkout stable

# 5. Move the `shortGPT` folder outside the `ShortGPT` directory and remove the `ShortGPT` folder
mv shortGPT ../
cd ..
rm -rf ShortGPT
```

There are a few changes we had to make to the files in order it to work. Please contact Kevin Yar for those details. 

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
