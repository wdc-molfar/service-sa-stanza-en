import io
import json
import sys
import traceback
import warnings

import stanza

warnings.filterwarnings("ignore", message=r"\[W033\]", category=UserWarning)

input_stream = io.TextIOWrapper(sys.stdin.buffer, encoding='utf-8')


def main(input_json):
    text = input_json["text"]

    doc = nlp(text)
    predict = doc.sentences[0].sentiment

    if predict == 2:
        emotion = "positive"
    elif predict == 0:
        emotion = "negative"
    else:
        emotion = "neutral"

    return {
        "emotion": emotion
    }


if __name__ == '__main__':
    nlp = stanza.Pipeline(lang='en', processors='tokenize,sentiment', tokenize_no_ssplit=True,
                          download_method=None, use_gpu=True)
    input_json = None
    for line in input_stream:

        # read json from stdin
        input_json = json.loads(line)

        try:
            output = main(input_json)
        except BaseException as ex:
            ex_type, ex_value, ex_traceback = sys.exc_info()

            output = {"error": ''}
            output['error'] += "Exception type : %s; \n" % ex_type.__name__
            output['error'] += "Exception message : %s\n" % ex_value
            output['error'] += "Exception traceback : %s\n" % "".join(
                traceback.TracebackException.from_exception(ex).format())

        output_json = json.dumps(output, ensure_ascii=False).encode('utf-8')
        sys.stdout.buffer.write(output_json)
        print()
