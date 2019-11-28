# Mender-convert

-------------------------------------------------------------------------------

## Configuration Files

The configuration files is how `Mender-convert` adds support for board-specific
configuration. Configuration files for the `mender-convert` script can be found in the
*/configs* directory. A run of `mender-convert` can include multiple
configuration files, whereas each configuration file is added with the
*--config* command-line option. The standard configuration (which will always be
included, can be found in the */configs/mender_conver_config*), and includes all
the possible configuration options which the tool supports.

Hence, if you wish to add support for another board to `Mender-convert`, then
this is where it should be added.

-------------------------------------------------------------------------------

## Hooks/Overrides

The `Mender-convert` tool supports the addition of user *hooks* to override, or
add to some specific part of the modification process. Currently the supported hooks are:

| script                | Hook/Override    | Intended function |
|:---                   | :---             | :----             |
| mender-convert-modify |  platform_modify | Perform platform specific modifications |
| mender-convert-package|  platform_package | Perform platform specific package operations |
| some_included_config_file | mender_create_artifact | Override the creation of the Mender-Artifact through modifying the command which calls the `mender-artifact` tool. A good starting point is the standard function found in the standard configuration file *configs/mender_convert_config* |

These are added to the specific configuration file of the users choice.

-------------------------------------------------------------------------------

## Default Variables

These are the default configuration used by mender-convert. You can override
any option specified here by providing your own configuration file using the
'--config' argument.


| Variable | Values | Description |
| :---:    | :---:  | :----       |
| MENDER_COMPRESS_DISK_IMAGE    |  y/n |  This is useful when you have large disk images, compressing them makes it easier to transfer them between e.g an build server and a local machine, and obviously saves space. |
| MENDER_ARTIFACT_COMPRESSION | gzip(default)/lzma/none | The compression algorithm to use on the generated Artifact. In general LZMA will produce a smaller Mender Artifact (2-3x) but will significantly increase time spent generating the Mender Artifact (10x) |
| MENDER_ENABLE_SYSTEMD | y/n | You want this enabled if you want the Mender client to operate in managed mode and connect to a server. If you are not interested connecting to a server and will only be running standalone mode updates, then you can safely disable this. |
| MENDER_ENABLE_SYSTEMD | y/n | If you want this enabled if you want the Mender client to operate in managed mode and connect to a server. If you are not interested connecting to a server and will only be running standalone mode updates, then you can safely disable this. |
| MENDER_DATA_PART_FSTAB_OPTS| defaults/fstab specific | Options passed on to fstab |
| MENDER_DATA_PART_GROWFS| y/n | Enable/Disable automatically growing the filesystem to fill the physical storage device |
| MENDER_ARTIFACT_NAME | - | Explicitly set the name of the generated update Artifact. Required for the conversion to succeed. However, should be specified on the command line, and not in the configuration. |
| MENDER_DEVICE_TYPE | - | Set the device type specified by the Artifact. If left empty it will default to the value of '/etc/hostname' |
| MENDER_STORAGE_TOTAL_SIZE_MB| 8192 (default) | The size of the storage medium of the device |
| MENDER_BOOT_PART_SIZE_MB | 40 (default) | The size of the boot partition |
| MENDER_DATA_PART_SIZE_MB | 128 (default) | The size of the Mender data partition |
| MENDER_PARTITION_ALIGNMENT | 8388608 ( 8MB, default) | The partition alignment expressed in bytes |
| MENDER_CLIENT_VERSION | master (default) | The version of the Mender client to include in the update |
| MENDER_STORAGE_URL | https://d1b0l86ne08fsf.cloudfront.net (default) | The source of the binaries employed by the `Mender-convert` tool |
| MENDER_GITHUB_ORG | https://github.com/mendersoftware (default) | The URL prefix for looking up the mendersoftware dependencies |
| MENDER_STORAGE_DEVICE | /dev/mmcblk0p (default) | Set the device file corresponding to the root filesystem partitions |
| MENDER_BOOT_PART_INDEX | 1 (default)  | Set the default index for the boot partition |
| MENDER_ROOTFS_PART_A_INDEX | 2 (default) | Set the default index of the rootfs part-A partition |
| MENDER_ROOTFS_PART_B_INDEX | 3 (default) | Set the default index of the rootfs part-B partition |
| MENDER_DATA_PART_INDEX | 4 (default) | Set the index of the data partition |
| MENDER_KERNEL_DEVICETREE | kernel.dtb (default) | Set the name of the kernel devicetree file |
| MENDER_USE_BMAP | y/n (default) | Enable/Disable the usage of bmap index in the generated image |

-------------------------------------------------------------------------------

## Rootfs-Overlays

Rootfs-overlays is a method for modifying the final filesystem shown to the
userspace process, without actually changing the underlying file-system. Changes
to a file, such as `/etc/mender/mender.conf` can simply be added to a higher
layer in the overlay-fs, and hence, only the top layer `mender.conf` file will
be available at runtime. This is how the `Mender-convert` tool enables modifying
files in the original rootfilesystem.

One example of an overlay-rootfs addition can be found in the `rootfs-overlay-demo` directory, which contains:
```bash
rootfs_overlay_demo
└── etc
    ├── hosts
    └── mender
        ├── mender.conf
        └── server.crt
```

Hence, in the final image, the files, and folder shown above will become a part
of the final file tree available to the device on boot.

If the final image needs application configurations and additions, this is the
recommended way of doing it.

-------------------------------------------------------------------------------
