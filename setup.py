# -*- coding: utf-8 -*-
from setuptools import setup, find_packages

with open('requirements.txt') as f:
	install_requires = f.read().strip().split('\n')

# get version from __version__ variable in extraesia/__init__.py
from extraesia import __version__ as version

setup(
	name='extraesia',
	version=version,
	description='Customization App For Erpnext',
	author='Youssef Restom',
	author_email='youssef@totrox.com',
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
