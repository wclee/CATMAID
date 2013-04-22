# General Django settings for mysite project.

import django.conf.global_settings as DEFAULT_SETTINGS

# A list of people who get code error notifications. They will get an email
# if DEBUG=False and a view raises an exception.
ADMINS = (
    # ('Your Name', 'your_email@domain.com'),
)

# A tuple in the same format as ADMINS of people who get broken-link
# notifications when SEND_BROKEN_LINKS_EMAILS=True.
MANAGERS = ADMINS

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader'
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'catmaid.middleware.AnonymousAuthenticationMiddleware',
    'catmaid.middleware.AjaxExceptionMiddleware', 
    'django.middleware.transaction.TransactionMiddleware',
    )

ROOT_URLCONF = 'mysite.urls'

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.admin',
    'django.contrib.staticfiles',
    'devserver',
    'djcelery',
    'taggit',
    'adminplus',
    'catmaid',
    'guardian',
    'south',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    # ... include the providers you want to enable:
    # 'allauth.socialaccount.providers.dropbox',
    'allauth.socialaccount.providers.facebook',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    'allauth.socialaccount.providers.linkedin',
    'allauth.socialaccount.providers.openid',
    'allauth.socialaccount.providers.persona',
    'allauth.socialaccount.providers.soundcloud',
    'allauth.socialaccount.providers.stackexchange',
    # 'allauth.socialaccount.providers.twitch',
    'allauth.socialaccount.providers.twitter',
    # 'allauth.socialaccount.providers.weibo',
    # 'bootstrapform',
)

# Use the default template context processors. If custom ones should be
# added, please append it to the tuple to make sure the default processors
# are still available. See this page for further detail:
# http://blog.madpython.com/2010/04/07/django-context-processors-best-practice/
TEMPLATE_CONTEXT_PROCESSORS = DEFAULT_SETTINGS.TEMPLATE_CONTEXT_PROCESSORS + (
    "allauth.account.context_processors.account",
    "allauth.socialaccount.context_processors.socialaccount",
    )

# The URL requests are redirected after login
LOGIN_REDIRECT_URL = '/'

# The URL where requests are redirected after login
LOGIN_URL = '/accounts/login'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend', # default
    'guardian.backends.ObjectPermissionBackend',
    # `allauth` specific authentication methods, such as login by e-mail
    "allauth.account.auth_backends.AuthenticationBackend",
)

# User-ID of the anonymous (i.e. not-logged-in) user. This is usualld -1.
ANONYMOUS_USER_ID = -1

SOUTH_DATABASE_ADAPTERS = {'default': 'south.db.postgresql_psycopg2'}

# The current site in the django_site database table. This is used so that
# applications can hook into specific site(s) and a single database can manage
# content of multiple sites.
SITE_ID = 1

# Default user profile settings
PROFILE_DEFAULT_INVERSE_MOUSE_WHEEL = False
PROFILE_SHOW_TEXT_LABEL_TOOL = False
PROFILE_SHOW_TAGGING_TOOL = False
PROFILE_SHOW_CROPPING_TOOL = False
PROFILE_SHOW_SEGMENTATION_TOOL = False
PROFILE_SHOW_TRACING_TOOL = False
PROFILE_SHOW_ONTOLOGY_TOOL = False

# A couple of functions useful for generating default directories to
# be used in the settings files:

import os, errno

def relative(*path_components):
    '''Returns a path relative to the directory this file is in'''

    base = os.path.abspath(os.path.dirname(__file__))
    all_parts = [base] + list(path_components)
    return os.path.realpath(os.path.join(*all_parts))

# From: http://stackoverflow.com/q/600268/223092

def mkdir_p(path):
    try:
        os.makedirs(path)
    except OSError as exc:
        if exc.errno == errno.EEXIST and os.path.isdir(path):
            pass
        else:
            raise

import sys
from os.path import realpath

PROJECT_ROOT = relative('..', '..')
for subdirectory in ('projects', 'applications', 'lib'):
    full_path = os.path.join(PROJECT_ROOT, subdirectory)
    sys.path.insert(0, full_path)
