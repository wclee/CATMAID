import json

from django.http import HttpResponse
from django.contrib.auth.models import User
from django.conf import settings

class AnonymousAuthenticationMiddleware(object):
    """ This middleware class tests whether the current user is the
    anonymous user. If so, it replaces the request.user object with
    Guardian's anonymous user and monkey patchs it to behave like
    Django's anonymou user.
    """
    def process_request(self, request):
        if request.user.is_anonymous() and settings.ANONYMOUS_USER_ID:
            request.user = User.objects.get(id=settings.ANONYMOUS_USER_ID)
            request.user.is_anonymous = lambda: True
            request.user.is_authenticated = lambda: False
        return None

class AjaxExceptionMiddleware(object):

    def process_exception(self, request, exception):
        response = {'error': str(exception)}
        if settings.DEBUG:
            import sys, traceback
            (exc_type, exc_info, tb) = sys.exc_info()
            response['type'] = exc_type.__name__
            response['info'] = str(exc_info)
            response['traceback'] = ''.join(traceback.format_tb(tb))
        return HttpResponse(json.dumps(response))
