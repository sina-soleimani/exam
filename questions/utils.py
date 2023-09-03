from os import path

from django.core.exceptions import ValidationError
from django.utils import timezone



def is_image(ext):
    support_ext = ['jpeg', 'jpg', 'png', 'bmp']
    if ext.lower() not in support_ext:
        raise ValidationError('unknown file format')
    return True


def is_audio(ext):
    support_ext = ['mp3', 'm4a']
    if ext.lower() not in support_ext:
        raise ValidationError('unknown file format')
    return True


def audio_path(instance, filename):
    ext = filename.split('.')[-1].lower()
    if is_audio(ext):
        return path.join('.', 'aud', 'audio_book', '{}.{}'.format(int(timezone.now().timestamp()), ext))


def image_path(instance, filename):
    ext = filename.split('.')[-1].lower()
    if is_image(ext):
        return path.join('.', 'img', 'author', '{}.{}'.format(int(timezone.now().timestamp()), ext))

