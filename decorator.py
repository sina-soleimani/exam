# decorators.py
import time
from functools import wraps
from django.core.exceptions import PermissionDenied
from django.shortcuts import render, redirect
from django.urls import reverse
from django.shortcuts import render, HttpResponseRedirect



def access_level_required(required_level):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(self, *args, **kwargs):
            try:
                user_access_level = self.request.user.access_level
            except AttributeError:
                try:
                    user_access_level = self.user.access_level
                except AttributeError:
                    # return HttpResponseRedirect('/logout/')

                    raise PermissionDenied("You don't have permission to access this page")

            except ValueError:
                # If self.request.user is not available or any other unexpected error occurs
                raise PermissionDenied("You don't have permission to access this page")

            if user_access_level == required_level or user_access_level == 'A':
                return view_func(self, *args, **kwargs)
            else:
                # Delay the redirection by 5 seconds
                time.sleep(5)

                # Redirect to the logout URL

        # return redirect(reverse('user:logout'))

        return wrapper


    return decorator
