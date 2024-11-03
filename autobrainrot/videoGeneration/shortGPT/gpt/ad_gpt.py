from shortGPT.gpt import gpt_utils
import json
def generateAds(ads_type):
    chat, system = gpt_utils.load_local_yaml_prompt('prompt_templates/ad_generator.yaml')
    chat = chat.replace("<<AD_TYPE>>", ads_type)
    result = gpt_utils.gpt3Turbo_completion(chat_prompt=chat, system=system, temp=1.3)
    return result

